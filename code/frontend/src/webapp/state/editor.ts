import { defineStore } from "pinia";
import { computed } from "vue";

import {
    type Node as VueFlowNode,
    type Edge as VueFlowEdge,
    type Styles as VueFlowSyles,
    MarkerType
} from "@vue-flow/core";

import * as common from "@decision-support-ui/common";
import { useGraphStore } from "./graph";
import { getHandlePositions } from "@/common/layout";
import { useSessionStorage } from "@vueuse/core";

export const EDITOR_STORE_ID = "editor";

const getDefaultEditorState = (): common.EditorStoreState => {
    return {
        subgraphId: null,
        locked: false,
        snapToGrid: true,
        edgeStyle: common.SMOOTH_STEP_EDGE_STYLE_TYPE,
        background: common.DOTS_EDITOR_BACKGROUND,
        autoAddComputationEdges: true
    };
};

export const useEditorStore = defineStore(EDITOR_STORE_ID, () => {
    const graphStore = useGraphStore();

    // --- state

    const state = useSessionStorage(EDITOR_STORE_ID, getDefaultEditorState());

    // computed

    const computedVisibleNodes = computed(() =>
        common.filterNodesVisibleInSubgraph(state.value.subgraphId, graphStore.state.nodes)
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
            graphStore.isVariableNameValid,
            graphStore.getComputedNodeIdFromVariableName
        );

        const projectedComputationEdges = common.projectEdgesToSubgraph(
            computationEdges,
            state.value.subgraphId,
            graphStore.getComputedNode,
            graphStore.getComputedSubgraphAncestors
        );

        const projectedComputationEdgesIdSet = new Set(projectedComputationEdges.map(e => e.id));

        const autoConnectNodeIdSet = new Set(
            graphStore.state.nodes.filter(n => n.visualization.autoConnect).map(n => n.id)
        );

        const filteredComputationEdges = state.value.autoAddComputationEdges
            ? projectedComputationEdges.filter(
                  e => autoConnectNodeIdSet.has(e.source) && autoConnectNodeIdSet.has(e.target)
              )
            : [];

        const filteredComputationEdgesIdSet = new Set(filteredComputationEdges.map(e => e.id));

        const projectedManualEdges = common.projectEdgesToSubgraph(
            graphStore.state.edges,
            state.value.subgraphId,
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
        if (state.value.subgraphId != null) {
            try {
                return graphStore.getComputedNode(state.value.subgraphId).visualization.title;
            } catch {
                // subgraph node might not exist (e.g. when undoing creating a subgraph while viewing it)
                state.value.subgraphId = null;
            }
        }
        return null;
    });

    // actions

    const switchToSubgraph = (nodeId: common.NodeId) => {
        state.value.subgraphId = nodeId;
    };

    const switchToParentSubgraph = () => {
        if (state.value.subgraphId) {
            state.value.subgraphId = graphStore.getComputedNode(state.value.subgraphId).subgraphParentId;
        }
    };

    const switchEdgeStyle = () => {
        const nextIdx =
            (common.AVAILABLE_EDGE_STYLE_TYPES.indexOf(state.value.edgeStyle) + 1) %
            common.AVAILABLE_EDGE_STYLE_TYPES.length;
        state.value.edgeStyle = common.AVAILABLE_EDGE_STYLE_TYPES[nextIdx] ?? common.SMOOTH_STEP_EDGE_STYLE_TYPE;
    };

    const switchBackground = () => {
        const nextIdx =
            (common.AVAILABLE_EDITOR_BACKGROUNDS.indexOf(state.value.background) + 1) %
            common.AVAILABLE_EDITOR_BACKGROUNDS.length;
        state.value.background = common.AVAILABLE_EDITOR_BACKGROUNDS[nextIdx] ?? common.DOTS_EDITOR_BACKGROUND;
    };

    const toggleLocked = () => {
        state.value.locked = !state.value.locked;
    };

    const toggleSnapToGrid = () => {
        state.value.snapToGrid = !state.value.snapToGrid;
    };

    const toggleAutoAddComputationEdges = () => {
        state.value.autoAddComputationEdges = !state.value.autoAddComputationEdges;
    };

    const reset = () => {
        state.value = getDefaultEditorState();
    };

    return {
        state,
        switchToSubgraph,
        switchToParentSubgraph,
        computedVueFlowNodes,
        computedVueFlowEdges,
        computedSubgraphTitle,
        toggleLocked,
        toggleSnapToGrid,
        toggleAutoAddComputationEdges,
        switchEdgeStyle,
        switchBackground,
        reset
    };
});
