<script setup lang="ts">
    import { useFlowGraphStore } from "@/state/graph";
    import * as common from "@decision-support-ui/common";
    import { useVueFlow, type Rect, type XYPosition } from "@vue-flow/core";

    import FlowNodeBox from "../../components/editor/graph/FlowNodeBox.vue";
    import { useEditorSettingsStore } from "@/state/settings";

    const { fitView, screenToFlowCoordinate, getIntersectingNodes, zoomTo, removeSelectedNodes, getSelectedNodes } =
        useVueFlow("editor");

    const graphStore = useFlowGraphStore();
    const editorSettings = useEditorSettingsStore();

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
            title: "Result",
            nodeType: common.VARIABLE_NODE_TYPE,
            functionType: common.RESULT_FUNCTION_TYPE,
            styleType: common.RESULT_STYLE_TYPE
        },
        {
            title: "Collection",
            nodeType: common.COLLECTION_NODE_TYPE,
            functionType: common.EMPTY_FUNCTION_TYPE,
            styleType: common.COLLECTION_STYLE_TYPE
        }
    ];

    const determineParentNode = (position: XYPosition) => {
        // determine which node could be the best parent node based on cursor position
        // (there might be multiple in case of nested nodes or overlapping nodes)
        const intersectingGraphNodes = getIntersectingNodes({ ...position, width: 1, height: 1 } as Rect, false);
        const intersectingNodes = intersectingGraphNodes.map(n => graphStore.getComputedNode(n.id).value);

        // remove any ancestor nodes from the list of intersecting nodes
        const ancestorsNodeIds = intersectingNodes
            .reduce((p, n) => [...p, ...graphStore.getComputedAncestorNodes(n.id).value], [] as common.Node[])
            .map(n => n.id);

        // consider only child nodes (remove any ancestor nodes)
        const candidateParentNodes = intersectingNodes.filter(n => !ancestorsNodeIds.includes(n.id));

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
        const topleft = screenToFlowCoordinate({
            x: event.clientX,
            y: event.clientY
        });

        const parentNode = determineParentNode(topleft);
        const ancestorNodes = parentNode ? graphStore.getComputedAncestorNodes(parentNode.id).value : [];
        const ancestorOffset = [parentNode, ...ancestorNodes].reduce(
            (p, n) => ({ x: p.x + (n?.visualization.position.x ?? 0), y: p.y + (n?.visualization.position.y ?? 0) }),
            { x: 0, y: 0 } as XYPosition
        );
        const newNodeSize = common.getDefaultNodeSize(nodeType);
        const newNodePosition = {
            x: topleft.x - newNodeSize.width / 2 - ancestorOffset.x,
            y: topleft.y - newNodeSize.height / 2 - ancestorOffset.y
        };

        graphStore.addNewNodeAction(title, nodeType, functionType, styleType, {
            position: newNodePosition,
            size: newNodeSize,
            parentNodeId: parentNode?.id
        });

        removeSelectedNodes(getSelectedNodes.value);
    };

    const onNodeClick = (
        title: string,
        nodeType: common.NodeType,
        functionType: common.NodeFunctionType,
        styleType: common.NodeStyleType
    ) => {
        graphStore.addNewNodeAction(title, nodeType, functionType, styleType);
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
                        :disabled="!graphStore.history.canUndo"
                        @click="graphStore.history.undo"
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
                        :disabled="!graphStore.history.canRedo"
                        @click="graphStore.history.redo"
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

            <v-tooltip
                location="bottom"
                :text="editorSettings.snapToGrid ? 'snap to grid' : 'free movement'"
                open-delay="500"
            >
                <template #activator="{ props }">
                    <v-btn
                        v-bind="props"
                        :icon="editorSettings.snapToGrid ? 'mdi-grid' : 'mdi-cursor-move'"
                        variant="outlined"
                        size="small"
                        @click="editorSettings.toggleSnapToGrid"
                    ></v-btn>
                </template>
            </v-tooltip>

            <v-tooltip location="bottom" :text="editorSettings.locked ? 'unlock graph' : 'lock graph'" open-delay="500">
                <template #activator="{ props }">
                    <v-btn
                        v-bind="props"
                        :icon="editorSettings.locked ? 'mdi-lock-outline' : 'mdi-lock-open-variant-outline'"
                        variant="outlined"
                        size="small"
                        @click="editorSettings.toggleLocked"
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
                :draggable="true"
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
            <v-tooltip location="bottom" text="change edge style" open-delay="500">
                <template #activator="{ props }">
                    <v-btn
                        v-bind="props"
                        :icon="
                            editorSettings.edgeStyle == common.STRAIGHT_EDGE_STYLE_TYPE
                                ? 'mdi-vector-polyline'
                                : editorSettings.edgeStyle == common.BEZIER_EDGE_STYLE_TYPE
                                  ? 'mdi-vector-bezier'
                                  : 'mdi-square-wave'
                        "
                        variant="outlined"
                        size="small"
                        @click="editorSettings.switchEdgeStyle"
                    ></v-btn>
                </template>
            </v-tooltip>
            <v-tooltip location="bottom" text="change background" open-delay="500">
                <template #activator="{ props }">
                    <v-btn
                        v-bind="props"
                        :icon="
                            editorSettings.background == common.DOTS_EDITOR_BACKGROUND
                                ? 'mdi-dots-grid'
                                : editorSettings.background == common.LINES_EDITOR_BACKGROUND
                                  ? 'mdi-grid'
                                  : ''
                        "
                        variant="outlined"
                        size="small"
                        @click="editorSettings.switchBackground"
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
        align-items: center;

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
            min-width: 6em;
        }
    }
</style>
