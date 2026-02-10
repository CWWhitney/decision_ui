<script setup lang="ts">
    import { useGraphStore } from "@/state/graph";
    import * as common from "@decision-support-ui/common";
    import { useVueFlow, type Rect, type XYPosition } from "@vue-flow/core";

    import FlowNodeBox from "../../components/editor/graph/FlowNodeBox.vue";
    import { useEditorStore } from "@/state/editor";

    const { fitView, screenToFlowCoordinate, getIntersectingNodes, zoomTo, removeSelectedNodes, getSelectedNodes } =
        useVueFlow("editor");

    const graph = useGraphStore();
    const editor = useEditorStore();

    const TOOLBAR_NODES: {
        title: string;
        nodeType: common.NodeType;
        functionType: common.NodeFunctionType;
        styleType: common.NodeStyleType;
    }[] = [
        {
            title: "Cost",
            nodeType: common.VARIABLE_NODE_TYPE,
            functionType: common.ESTIMATE_FUNCTION_TYPE,
            styleType: common.COST_STYLE_TYPE
        },
        {
            title: "Benefit",
            nodeType: common.VARIABLE_NODE_TYPE,
            functionType: common.ESTIMATE_FUNCTION_TYPE,
            styleType: common.BENEFIT_STYLE_TYPE
        },
        {
            title: "Risk",
            nodeType: common.VARIABLE_NODE_TYPE,
            functionType: common.ESTIMATE_FUNCTION_TYPE,
            styleType: common.RISK_STYLE_TYPE
        },
        {
            title: "Generic",
            nodeType: common.VARIABLE_NODE_TYPE,
            functionType: common.OPERATION_FUNCTION_TYPE,
            styleType: common.GENERIC_STYLE_TYPE
        },
        {
            title: "Subgraph",
            nodeType: common.SUBGRAPH_NODE_TYPE,
            functionType: common.EMPTY_FUNCTION_TYPE,
            styleType: common.GENERIC_STYLE_TYPE
        },
        {
            title: "Collection",
            nodeType: common.COLLECTION_NODE_TYPE,
            functionType: common.EMPTY_FUNCTION_TYPE,
            styleType: common.COLLECTION_STYLE_TYPE
        },
        {
            title: "Result",
            nodeType: common.VARIABLE_NODE_TYPE,
            functionType: common.RESULT_FUNCTION_TYPE,
            styleType: common.RESULT_STYLE_TYPE
        }
    ];

    const determineParentNode = (position: XYPosition) => {
        // determine which node could be the best parent node based on cursor position
        // (there might be multiple in case of nested nodes or overlapping nodes)
        const intersectingGraphNodes = getIntersectingNodes({ ...position, width: 1, height: 1 } as Rect, false);
        const intersectingCollectionNodes = intersectingGraphNodes
            .map(n => graph.getComputedNode(n.id))
            .filter(n => n.type == common.COLLECTION_NODE_TYPE);

        // remove any ancestor nodes from the list of intersecting nodes
        const ancestorsNodeIds = intersectingCollectionNodes
            .reduce((p, n) => [...p, ...graph.getComputedNodeAncestors(n.id)], [] as common.Node[])
            .map(n => n.id);

        // consider only child nodes (remove any ancestor nodes)
        const candidateParentNodes = intersectingCollectionNodes.filter(n => !ancestorsNodeIds.includes(n.id));

        // pick the first one (even though there still might be more than one)
        return candidateParentNodes.length > 0 ? candidateParentNodes[0] : null;
    };

    const onNodeDragEnd = (
        event: DragEvent,
        title: string,
        nodeType: common.NodeType,
        functionType: common.NodeFunctionType,
        styleType: common.NodeStyleType
    ) => {
        if (editor.state.locked) {
            return;
        }

        const mousePosition = screenToFlowCoordinate({
            x: event.clientX,
            y: event.clientY
        });
        const parentNode = determineParentNode(mousePosition);
        graph.addNewNodeAction(title, nodeType, functionType, styleType, {
            position: mousePosition,
            size: common.getDefaultNodeSize(nodeType),
            nodeParentId: parentNode ? parentNode.id : null,
            subgraphParentId: editor.state.subgraphId
        });

        removeSelectedNodes(getSelectedNodes.value);
    };

    const onNodeClick = (
        title: string,
        nodeType: common.NodeType,
        functionType: common.NodeFunctionType,
        styleType: common.NodeStyleType
    ) => {
        if (editor.state.locked) {
            return;
        }

        const position = screenToFlowCoordinate({
            x: window.innerWidth / 2.0,
            y: window.innerHeight / 2.0
        });

        graph.addNewNodeAction(title, nodeType, functionType, styleType, {
            subgraphParentId: editor.state.subgraphId,
            position
        });
    };
</script>

<template>
    <div class="flowpage_toolbar">
        <div class="options">
            <v-tooltip location="bottom" text="undo" open-delay="500">
                <template #activator="{ props }">
                    <v-btn
                        v-bind="props"
                        icon="mdi-undo"
                        variant="outlined"
                        size="small"
                        :disabled="!graph.history.canUndo || editor.state.locked"
                        @click="graph.history.undo"
                    ></v-btn>
                </template>
            </v-tooltip>
            <v-tooltip location="bottom" text="redo" open-delay="500">
                <template #activator="{ props }">
                    <v-btn
                        v-bind="props"
                        icon="mdi-redo"
                        variant="outlined"
                        size="small"
                        :disabled="!graph.history.canRedo || editor.state.locked"
                        @click="graph.history.redo"
                    ></v-btn>
                </template>
            </v-tooltip>

            <v-tooltip location="bottom" text="auto fit view" open-delay="500">
                <template #activator="{ props }">
                    <v-btn
                        v-bind="props"
                        icon="mdi-fit-to-screen-outline"
                        variant="outlined"
                        size="small"
                        @click="fitView"
                    ></v-btn>
                </template>
            </v-tooltip>

            <v-tooltip location="bottom" text="reset zoom" open-delay="500">
                <template #activator="{ props }">
                    <v-btn
                        v-bind="props"
                        icon="mdi-numeric-1-box-outline"
                        variant="outlined"
                        size="small"
                        @click="() => zoomTo(1.0)"
                    ></v-btn>
                </template>
            </v-tooltip>
            <v-tooltip location="bottom" text="create subgraph from selection" open-delay="500">
                <template #activator="{ props }">
                    <v-btn
                        v-bind="props"
                        icon="mdi-sitemap-outline mdi-rotate-90"
                        variant="outlined"
                        size="small"
                        :disabled="getSelectedNodes.length == 0"
                        @click="editor.createSubgraphFromSelection(getSelectedNodes.map(n => n.id))"
                    ></v-btn>
                </template>
            </v-tooltip>
        </div>
        <div class="nodes">
            <FlowNodeBox
                v-for="node in TOOLBAR_NODES"
                :key="node.title"
                :node-type="node.nodeType"
                :function-type="node.functionType"
                :style-type="node.styleType"
                :draggable="!editor.state.locked"
                width="auto"
                @click="() => onNodeClick(node.title, node.nodeType, node.functionType, node.styleType)"
                @dragend="
                    (event: DragEvent) =>
                        onNodeDragEnd(event, node.title, node.nodeType, node.functionType, node.styleType)
                "
                >{{ node.title }}</FlowNodeBox
            >
        </div>
        <div class="options">
            <v-tooltip location="bottom" :text="editor.state.locked ? 'unlock graph' : 'lock graph'" open-delay="500">
                <template #activator="{ props }">
                    <v-btn
                        v-bind="props"
                        :icon="editor.state.locked ? 'mdi-lock-outline' : 'mdi-lock-open-variant-outline'"
                        variant="outlined"
                        size="small"
                        @click="editor.toggleLocked"
                    ></v-btn>
                </template>
            </v-tooltip>
            <v-tooltip
                location="bottom"
                :text="editor.state.snapToGrid ? 'snap to grid' : 'free movement'"
                open-delay="500"
            >
                <template #activator="{ props }">
                    <v-btn
                        v-bind="props"
                        :icon="editor.state.snapToGrid ? 'mdi-grid' : 'mdi-cursor-move'"
                        variant="outlined"
                        size="small"
                        @click="editor.toggleSnapToGrid"
                    ></v-btn>
                </template>
            </v-tooltip>
            <v-tooltip location="bottom" text="change edge style" open-delay="500">
                <template #activator="{ props }">
                    <v-btn
                        v-bind="props"
                        :icon="
                            editor.state.edgeStyle == common.STRAIGHT_EDGE_STYLE_TYPE
                                ? 'mdi-vector-polyline'
                                : editor.state.edgeStyle == common.BEZIER_EDGE_STYLE_TYPE
                                  ? 'mdi-vector-bezier'
                                  : 'mdi-square-wave'
                        "
                        variant="outlined"
                        size="small"
                        @click="editor.switchEdgeStyle"
                    ></v-btn>
                </template>
            </v-tooltip>
            <v-tooltip location="bottom" text="change background" open-delay="500">
                <template #activator="{ props }">
                    <v-btn
                        v-bind="props"
                        :icon="
                            editor.state.background == common.DOTS_EDITOR_BACKGROUND
                                ? 'mdi-dots-grid'
                                : editor.state.background == common.LINES_EDITOR_BACKGROUND
                                  ? 'mdi-grid'
                                  : ''
                        "
                        variant="outlined"
                        size="small"
                        @click="editor.switchBackground"
                    ></v-btn>
                </template>
            </v-tooltip>
        </div>
    </div>
</template>

<style lang="scss">
    .flowpage_toolbar {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        gap: 1em;

        background: #fff;
        padding: 0.5em;

        .nodes {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5em;
            justify-content: center;
        }

        .options {
            justify-self: center;
            display: flex;
            flex-wrap: wrap;
            gap: 0.5em;
            background: #fff;

            &:first-child {
                justify-self: start;
            }

            &:last-child {
                justify-self: end;
            }
        }

        .flow-node-box {
            min-width: 5em;
            max-height: 5em;
        }
    }
</style>
