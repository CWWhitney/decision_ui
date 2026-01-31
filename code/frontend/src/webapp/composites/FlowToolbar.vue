<script setup lang="ts">
    import { useStore } from "@/state";
    import { useFlowGraphStore } from "@/state/flow/graph";
    import { useFlowOptionsStore } from "@/state/flow/options";
    import {
        BEZIER_EDGE_TYPE,
        DOTS_BACKGROUND,
        LINES_BACKGROUND,
        STRAIGHT_EDGE_TYPE,
        useFlowStyleStore
    } from "@/state/flow/style";
    import {
        BENEFIT_STYLE_TYPE,
        COLLECTION_NODE_TYPE,
        COLLECTION_STYLE_TYPE,
        COST_STYLE_TYPE,
        EMPTY_FUNCTION_TYPE,
        ESTIMATE_FUNCTION_TYPE,
        GENERIC_STYLE_TYPE,
        RESULT_FUNCTION_TYPE,
        getDefaultNodeSize,
        OPERATION_FUNCTION_TYPE,
        RISK_STYLE_TYPE,
        VARIABLE_NODE_TYPE,
        type Node,
        type NodeFunctionType,
        type NodeStyleType,
        type NodeType,
        RESULT_STYLE_TYPE
    } from "@decision-support-ui/common";
    import { useVueFlow, type Rect, type XYPosition } from "@vue-flow/core";

    import FlowNodeBox from "../components/flow/FlowNodeBox.vue";

    const {
        fitView,
        screenToFlowCoordinate,
        getIntersectingNodes,
        zoomTo,
        removeSelectedNodes,
        getSelectedNodes,
        setInteractive
    } = useVueFlow();

    const optionsStore = useFlowOptionsStore();
    const graphStore = useFlowGraphStore();
    const styleStore = useFlowStyleStore();

    const TOOLBAR_NODES: {
        title: string;
        nodeType: NodeType;
        functionType: NodeFunctionType;
        styleType: NodeStyleType;
    }[] = [
        {
            title: "Cost",
            nodeType: VARIABLE_NODE_TYPE,
            functionType: ESTIMATE_FUNCTION_TYPE,
            styleType: COST_STYLE_TYPE
        },
        {
            title: "Benefit",
            nodeType: VARIABLE_NODE_TYPE,
            functionType: ESTIMATE_FUNCTION_TYPE,
            styleType: BENEFIT_STYLE_TYPE
        },
        {
            title: "Risk",
            nodeType: VARIABLE_NODE_TYPE,
            functionType: ESTIMATE_FUNCTION_TYPE,
            styleType: RISK_STYLE_TYPE
        },
        {
            title: "Generic",
            nodeType: VARIABLE_NODE_TYPE,
            functionType: OPERATION_FUNCTION_TYPE,
            styleType: GENERIC_STYLE_TYPE
        },
        {
            title: "Result",
            nodeType: VARIABLE_NODE_TYPE,
            functionType: RESULT_FUNCTION_TYPE,
            styleType: RESULT_STYLE_TYPE
        },
        {
            title: "Collection",
            nodeType: COLLECTION_NODE_TYPE,
            functionType: EMPTY_FUNCTION_TYPE,
            styleType: COLLECTION_STYLE_TYPE
        }
    ];

    const determineParentNode = (position: XYPosition) => {
        // determine which node could be the best parent node based on cursor position
        // (there might be multiple in case of nested nodes or overlapping nodes)
        const intersectingGraphNodes = getIntersectingNodes({ ...position, width: 1, height: 1 } as Rect, false);
        const intersectingNodes = intersectingGraphNodes.map(n => graphStore.getComputedNode(n.id).value);

        // remove any ancestor nodes from the list of intersecting nodes
        const ancestorsNodeIds = intersectingNodes
            .reduce((p, n) => [...p, ...graphStore.getComputedAncestorNodes(n.id).value], [] as Node[])
            .map(n => n.id);

        // consider only child nodes (remove any ancestor nodes)
        const candidateParentNodes = intersectingNodes.filter(n => !ancestorsNodeIds.includes(n.id));

        // pick the first one (even though there still might be more than one)
        return candidateParentNodes.length > 0 ? candidateParentNodes[0] : null;
    };

    const onNodeDragEnd = (
        event: DragEvent,
        title: string,
        nodeType: NodeType,
        functionType: NodeFunctionType,
        styleType: NodeStyleType
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
        const newNodeSize = getDefaultNodeSize(nodeType);
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
        nodeType: NodeType,
        functionType: NodeFunctionType,
        styleType: NodeStyleType
    ) => {
        graphStore.addNewNodeAction(title, nodeType, functionType, styleType);
    };

    const onLockGraphClick = () => {
        if (optionsStore.locked) {
            setInteractive(true);
            optionsStore.setLocked(false);
        } else {
            removeSelectedNodes(getSelectedNodes.value);
            setInteractive(false);
            optionsStore.setLocked(true);
        }
    };
</script>

<template>
    <div class="flowpage_toolbar">
        <div class="toolbar_group">
            <v-tooltip location="bottom" text="undo" open-delay="500">
                <template #activator="{ props }">
                    <v-btn v-bind="props" icon="mdi-undo" variant="outlined" size="small" disabled></v-btn>
                </template>
            </v-tooltip>
            <v-tooltip location="bottom" text="redo" open-delay="500">
                <template #activator="{ props }">
                    <v-btn v-bind="props" icon="mdi-redo" variant="outlined" size="small" disabled></v-btn>
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

            <v-tooltip location="bottom" :text="optionsStore.locked ? 'unlock graph' : 'lock graph'" open-delay="500">
                <template #activator="{ props }">
                    <v-btn
                        v-bind="props"
                        :icon="optionsStore.locked ? 'mdi-lock-outline' : 'mdi-lock-open-variant-outline'"
                        variant="outlined"
                        size="small"
                        @click="onLockGraphClick"
                    ></v-btn>
                </template>
            </v-tooltip>
        </div>
        <div class="toolbar_group">
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
        <div class="toolbar_group">
            <v-tooltip location="bottom" text="change edge style" open-delay="500">
                <template #activator="{ props }">
                    <v-btn
                        v-bind="props"
                        :icon="
                            styleStore.edgeType == STRAIGHT_EDGE_TYPE
                                ? 'mdi-vector-polyline'
                                : styleStore.edgeType == BEZIER_EDGE_TYPE
                                  ? 'mdi-vector-bezier'
                                  : 'mdi-square-wave'
                        "
                        variant="outlined"
                        size="small"
                        @click="styleStore.switchEdgeType"
                    ></v-btn>
                </template>
            </v-tooltip>
            <v-tooltip location="bottom" text="change background" open-delay="500">
                <template #activator="{ props }">
                    <v-btn
                        v-bind="props"
                        :icon="
                            styleStore.background == DOTS_BACKGROUND
                                ? 'mdi-dots-grid'
                                : styleStore.background == LINES_BACKGROUND
                                  ? 'mdi-grid'
                                  : ''
                        "
                        variant="outlined"
                        size="small"
                        @click="styleStore.switchBackground"
                    ></v-btn>
                </template>
            </v-tooltip>

            <v-btn prepend-icon="mdi-bug-outline" variant="outlined" text="reset" @click="useStore().reset"
                >Reset</v-btn
            >
        </div>
    </div>
</template>

<style lang="scss">
    .flowpage_toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5em;
        justify-content: space-between;

        background: #fff;
        padding: 0.5em;

        .toolbar_group {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 0.5em;
            background: #fff;
        }

        .flow-node-box {
            min-width: 6em;
        }
    }
</style>
