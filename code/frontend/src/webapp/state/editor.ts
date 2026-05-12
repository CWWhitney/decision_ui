import { defineStore } from "pinia";
import { computed, ref } from "vue";

import {
    type Node as VueFlowNode,
    type Edge as VueFlowEdge,
    type Styles as VueFlowSyles,
    MarkerType
} from "@vue-flow/core";

import * as common from "@decision-support-ui/common";

import { useGraphStore } from "./graph";
import { getHandlePositions } from "../common/layout";
import { useValidatedSessionStorage } from "./io";
import { makeSafeComputedGetterByKey } from "../common/computed";

export const EDITOR_STORE_ID = "editor";

const getDefaultEditorTransientState = (): common.EditorStoreTansientState => {
    return {
        subgraphId: null,
        shouldFitOnNextUpdate: false
    };
};

const getDefaultEditorPersistedState = (): common.EditorStorePersistedState => {
    return {
        locked: false,
        snapToGrid: true,
        edgeStyle: common.SMOOTH_STEP_EDGE_STYLE_TYPE,
        background: common.DOTS_EDITOR_BACKGROUND,
        autoAddComputationEdges: true,
        autosave: true
    };
};

export const useEditorStore = defineStore(EDITOR_STORE_ID, () => {
    const graphStore = useGraphStore();
    const validatePersistedEditorState = common.validateSchema(common.EditorFileSchema);

    // --- state

    const transient = ref<common.EditorStoreTansientState>(getDefaultEditorTransientState());
    const persisted = useValidatedSessionStorage(
        EDITOR_STORE_ID,
        getDefaultEditorPersistedState(),
        validatePersistedEditorState
    );

    // computed

    const _computedNodeNamesWithVariableDuplicates = computed(() =>
        common.fromEntriesGrouped(
            common
                .findDuplicatesBy(
                    graphStore.state.nodes.filter(n => n.type == common.VARIABLE_NODE_TYPE),
                    n => n.function.variable
                )
                .map(n => [n.function.variable, n.visualization.title])
        )
    );

    const computedVisibleNodes = computed(() =>
        common.filterNodesVisibleInSubgraph(transient.value.subgraphId, graphStore.state.nodes)
    );

    const computedVueFlowNodes = computed(() => {
        return computedVisibleNodes.value.map(node => {
            return {
                id: node.id,
                position: { ...node.visualization.position },
                type: "custom",
                class:
                    `${node.type}-type ` +
                    `${node.function.type}-function-type ` +
                    `${node.visualization.style.type}-style-type`,
                width: node.visualization.size.width,
                height: node.visualization.size.height,
                parentNode: node.nodeParentId ? node.nodeParentId : undefined,
                extent: node.nodeParentId ? "parent" : undefined,
                expandParent: node.nodeParentId ? false : undefined,
                data: {
                    label: node.visualization.title,
                    nodeType: node.type,
                    functionType: node.function.type,
                    ...(node.visualization.style.type == common.CUSTOM_STYLE_TYPE && {
                        border: node.visualization.style.border
                    })
                }
            } as VueFlowNode;
        });
    });

    const _getVueFlowEdge = (
        edge: common.Edge,
        getComputedNodePosition: (nodeId: string) => common.Position,
        style: VueFlowSyles = {}
    ) => {
        const sourceNodePosition = getComputedNodePosition(edge.source);
        const targetNodePosition = getComputedNodePosition(edge.target);

        const [sourceHandle, targetHandle] = getHandlePositions(sourceNodePosition, targetNodePosition);
        return {
            id: edge.id,
            source: `${edge.source}`,
            target: `${edge.target}`,
            sourceHandle: sourceHandle,
            targetHandle: targetHandle,
            type: "custom",
            style,
            markerEnd: MarkerType.Arrow
        } as VueFlowEdge;
    };

    const computedVueFlowEdges = computed(() => {
        const computationEdges = common.getComputationEdges(
            graphStore.state.nodes,
            graphStore.getComputedVariableDependencies,
            graphStore.isVariableNameKnown,
            graphStore.getComputedNodeIdFromVariableName
        );

        const projectedComputationEdges = common.projectEdgesToSubgraph(
            computationEdges,
            transient.value.subgraphId,
            graphStore.getComputedNode,
            graphStore.getComputedSubgraphAncestors
        );

        const projectedComputationEdgesIdSet = new Set(projectedComputationEdges.map(e => e.id));

        const autoConnectNodeIdSet = new Set(
            graphStore.state.nodes.filter(n => n.visualization.autoConnect).map(n => n.id)
        );

        const filteredComputationEdges = persisted.value.autoAddComputationEdges
            ? projectedComputationEdges.filter(
                  e => autoConnectNodeIdSet.has(e.source) && autoConnectNodeIdSet.has(e.target)
              )
            : [];

        const filteredComputationEdgesIdSet = new Set(filteredComputationEdges.map(e => e.id));

        const projectedManualEdges = common.projectEdgesToSubgraph(
            graphStore.state.edges,
            transient.value.subgraphId,
            graphStore.getComputedNode,
            graphStore.getComputedSubgraphAncestors
        );

        const filteredManualEdges = projectedManualEdges.filter(e => !filteredComputationEdgesIdSet.has(e.id));

        const allEdges = [...filteredComputationEdges, ...filteredManualEdges];

        return allEdges.map(e =>
            _getVueFlowEdge(e, graphStore.getComputedNodePosition, {
                ...(!projectedComputationEdgesIdSet.has(e.id) && { strokeDasharray: 5 })
            })
        );
    });

    const computedSubgraphTitle = computed(() => {
        if (transient.value.subgraphId != null) {
            try {
                return graphStore.getComputedNode(transient.value.subgraphId).visualization.title;
            } catch {
                // subgraph node might not exist (e.g. when undoing creating a subgraph while viewing it)
                transient.value.subgraphId = null;
            }
        }
        return null;
    });

    const getComputedVariableNameError: (nodeId: common.NodeId) => string | null = makeSafeComputedGetterByKey(
        (nodeId: common.NodeId) => {
            const node = graphStore.getComputedNode(nodeId);
            if (node.type == common.VARIABLE_NODE_TYPE) {
                return common.getVariableNameError(
                    node.function.variable,
                    _computedNodeNamesWithVariableDuplicates.value
                );
            }
            return null;
        }
    );

    // actions

    const loadFromFile = (newState: common.EditorFileState) => {
        persisted.value = { ...newState };
        transient.value = {
            shouldFitOnNextUpdate: true,
            subgraphId: null
        };
    };

    const createSubgraphFromSelection = (selectedNodeIds: common.NodeId[]) => {
        if (selectedNodeIds.length == 0) {
            return;
        }

        const selectedNodes = selectedNodeIds.map(n => graphStore.getComputedNode(n));
        const centerPosition = common.getCenterPosition(
            selectedNodes.filter(n => n.nodeParentId == null).map(common.getNodeCenter)
        );
        const selectedNodeStyleTypeSet = new Set(
            selectedNodes
                .map(n => n.visualization.style.type)
                .filter(s => s != common.CUSTOM_STYLE_TYPE && s != common.COLLECTION_STYLE_TYPE)
        );
        const subgraphNodeStyle =
            selectedNodeStyleTypeSet.size == 1 ? [...selectedNodeStyleTypeSet][0]! : common.GENERIC_STYLE_TYPE;

        // create new subgraph node at the center of all selcted nodes
        const newSubgraphNode = graphStore.addNewNodeAction(
            "Subgraph",
            common.SUBGRAPH_NODE_TYPE,
            common.EMPTY_FUNCTION_TYPE,
            subgraphNodeStyle,
            {
                position: centerPosition,
                size: common.getDefaultNodeSize(common.SUBGRAPH_NODE_TYPE),
                subgraphParentId: transient.value.subgraphId
            }
        );

        // move all selected nodes to new subgraph
        for (const node of selectedNodes) {
            const childrenNodes = graphStore.getComputedNodeDescendants(node.id);
            for (const n of [...childrenNodes, node]) {
                n.subgraphParentId = newSubgraphNode.id;
                if (n.nodeParentId && !selectedNodeIds.includes(n.nodeParentId)) {
                    // reset parent node id if parent was not selected to be moved to the subgraph
                    n.nodeParentId = null;
                }
            }
        }
    };

    const switchToSubgraph = (nodeId: common.NodeId) => {
        transient.value.subgraphId = nodeId;
        if (graphStore.getComputedSubgraphChildren(nodeId).length > 0) {
            transient.value.shouldFitOnNextUpdate = true;
        }
    };

    const switchToParentSubgraph = () => {
        if (transient.value.subgraphId) {
            transient.value.subgraphId = graphStore.getComputedNode(transient.value.subgraphId).subgraphParentId;
            transient.value.shouldFitOnNextUpdate = true;
        }
    };

    const switchEdgeStyle = () => {
        const nextIdx =
            (common.AVAILABLE_EDGE_STYLE_TYPES.indexOf(persisted.value.edgeStyle) + 1) %
            common.AVAILABLE_EDGE_STYLE_TYPES.length;
        persisted.value.edgeStyle = common.AVAILABLE_EDGE_STYLE_TYPES[nextIdx] ?? common.SMOOTH_STEP_EDGE_STYLE_TYPE;
    };

    const switchBackground = () => {
        const nextIdx =
            (common.AVAILABLE_EDITOR_BACKGROUNDS.indexOf(persisted.value.background) + 1) %
            common.AVAILABLE_EDITOR_BACKGROUNDS.length;
        persisted.value.background = common.AVAILABLE_EDITOR_BACKGROUNDS[nextIdx] ?? common.DOTS_EDITOR_BACKGROUND;
    };

    const toggleLocked = () => {
        persisted.value.locked = !persisted.value.locked;
    };

    const toggleSnapToGrid = () => {
        persisted.value.snapToGrid = !persisted.value.snapToGrid;
    };

    const toggleAutoAddComputationEdges = () => {
        persisted.value.autoAddComputationEdges = !persisted.value.autoAddComputationEdges;
    };

    const markAsNeedsFitOnNextUpdate = () => {
        transient.value.shouldFitOnNextUpdate = true;
    };

    const markAsFittedOnUpdate = () => {
        transient.value.shouldFitOnNextUpdate = false;
    };

    const toggleAutosave = () => {
        persisted.value.autosave = !persisted.value.autosave;
    };

    const reset = () => {
        persisted.value = getDefaultEditorPersistedState();
    };

    return {
        transient,
        persisted,
        loadFromFile,
        createSubgraphFromSelection,
        switchToSubgraph,
        switchToParentSubgraph,
        computedVueFlowNodes,
        computedVueFlowEdges,
        computedSubgraphTitle,
        getComputedVariableNameError,
        toggleLocked,
        toggleSnapToGrid,
        toggleAutoAddComputationEdges,
        switchEdgeStyle,
        switchBackground,
        markAsFittedOnUpdate,
        markAsNeedsFitOnNextUpdate,
        toggleAutosave,
        reset
    };
});
