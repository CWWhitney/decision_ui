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
import { getHandlePositions } from "@/common/layout";

export const EDITOR_STORE_ID = "editor";

export const useEditorStore = defineStore(EDITOR_STORE_ID, () => {
    const graphStore = useGraphStore();

    // state

    const subgraphId = ref<common.SubgraphId | null>(null);
    const locked = ref(false);
    const snapToGrid = ref(true);
    const edgeStyle = ref<common.EdgeStyleType>(common.SMOOTH_STEP_EDGE_STYLE_TYPE);
    const background = ref<common.EditorBackground>(common.DOTS_EDITOR_BACKGROUND);
    const autoAddComputationEdges = ref<boolean>(true);

    // computed

    const computedVisibleNodes = computed(() =>
        common.filterNodesVisibleInSubgraph(subgraphId.value, graphStore.state.nodes)
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

        const computationEdgesIdSet = new Set(computationEdges.map(e => e.id));

        const manualEdges = autoAddComputationEdges.value
            ? graphStore.state.edges.filter(e => !computationEdgesIdSet.has(e.id))
            : graphStore.state.edges;

        const projectedComputationEdges = common.projectEdgesToSubgraph(
            computationEdges,
            subgraphId.value,
            graphStore.getComputedNode,
            graphStore.getComputedSubgraphAncestors
        );

        const projectedManualEdges = common.projectEdgesToSubgraph(
            manualEdges,
            subgraphId.value,
            graphStore.getComputedNode,
            graphStore.getComputedSubgraphAncestors
        );

        return [
            // computed edges
            ...(autoAddComputationEdges.value
                ? projectedComputationEdges.map(e => _getVueFlowEdge(e, graphStore.getComputedNodePosition))
                : []),
            // manual edges
            ...projectedManualEdges.map(e =>
                _getVueFlowEdge(e, graphStore.getComputedNodePosition, { strokeDasharray: 5 })
            )
        ];
    });

    const computedSubgraphTitle = computed(() => {
        if (subgraphId.value != null) {
            try {
                return graphStore.getComputedNode(subgraphId.value).visualization.title;
            } catch {
                // subgraph node might not exist (e.g. when undoing creating a subgraph while viewing it)
                subgraphId.value = null;
            }
        }
        return null;
    });

    // actions

    const switchToSubgraph = (nodeId: common.NodeId) => {
        subgraphId.value = nodeId;
    };

    const switchToParentSubgraph = () => {
        if (subgraphId.value) {
            subgraphId.value = graphStore.getComputedNode(subgraphId.value).subgraphParentId;
        }
    };

    const switchEdgeStyle = () => {
        const nextIdx =
            (common.AVAILABLE_EDGE_STYLE_TYPES.indexOf(edgeStyle.value) + 1) % common.AVAILABLE_EDGE_STYLE_TYPES.length;
        edgeStyle.value = common.AVAILABLE_EDGE_STYLE_TYPES[nextIdx] ?? common.SMOOTH_STEP_EDGE_STYLE_TYPE;
    };

    const switchBackground = () => {
        const nextIdx =
            (common.AVAILABLE_EDITOR_BACKGROUNDS.indexOf(background.value) + 1) %
            common.AVAILABLE_EDITOR_BACKGROUNDS.length;
        background.value = common.AVAILABLE_EDITOR_BACKGROUNDS[nextIdx] ?? common.DOTS_EDITOR_BACKGROUND;
    };

    const toggleLocked = () => {
        locked.value = !locked.value;
    };

    const toggleSnapToGrid = () => {
        snapToGrid.value = !snapToGrid.value;
    };

    const reset = () => {
        subgraphId.value = null;
        autoAddComputationEdges.value = true;
        locked.value = false;
        snapToGrid.value = true;
        edgeStyle.value = common.SMOOTH_STEP_EDGE_STYLE_TYPE;
        background.value = common.DOTS_EDITOR_BACKGROUND;
    };

    return {
        subgraphId,
        locked,
        snapToGrid,
        edgeStyle,
        background,
        switchToSubgraph,
        switchToParentSubgraph,
        computedVueFlowNodes,
        computedVueFlowEdges,
        computedSubgraphTitle,
        toggleLocked,
        toggleSnapToGrid,
        switchEdgeStyle,
        switchBackground,
        reset
    };
});
