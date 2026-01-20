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
        COLLECTION_NODE_TYPE,
        DEFAULT_NODE_TYPE_TITLES,
        ESTIMATE_NODE_TYPE,
        getDefaultNodeSize,
        LOOP_NODE_TYPE,
        LOOP_OPERATION_NODE_TYPE,
        OPERATION_NODE_TYPE,
        RESULT_NODE_TYPE,
        type Node,
        type NodeType
    } from "@decision-support-ui/common";
    import { useVueFlow, type Rect, type XYPosition } from "@vue-flow/core";

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

    const NODE_TYPES = [
        ESTIMATE_NODE_TYPE,
        OPERATION_NODE_TYPE,
        LOOP_NODE_TYPE,
        RESULT_NODE_TYPE,
        COLLECTION_NODE_TYPE
    ] as NodeType[];

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

    const onNodeDragEnd = (event: DragEvent, nodeType: NodeType) => {
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

        const newNodeType =
            parentNode?.type == LOOP_NODE_TYPE && nodeType == OPERATION_NODE_TYPE ? LOOP_OPERATION_NODE_TYPE : nodeType;

        graphStore.addNewNodeAction(newNodeType, {
            position: newNodePosition,
            size: newNodeSize,
            parentNodeId: parentNode?.id
        });

        removeSelectedNodes(getSelectedNodes.value);
    };

    const onNodeClick = (nodeType: NodeType) => {
        graphStore.addNewNodeAction(nodeType);
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
            <div
                v-for="nodeType in NODE_TYPES"
                :key="nodeType"
                :class="`vue-flow__node ${nodeType}`"
                :draggable="true"
                @click="() => onNodeClick(nodeType)"
                @dragend="event => onNodeDragEnd(event, nodeType)"
            >
                <div class="content">{{ DEFAULT_NODE_TYPE_TITLES[nodeType] }}</div>
            </div>
            <!--<v-btn
        icon="mdi-dots-vertical"
        variant="outlined"
        size="small"
        disabled
        rounded="0"
        style="border-width: 1.5px"
      ></v-btn>-->
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

        .vue-flow__node {
            position: relative;
            min-width: 6em;

            .content {
                padding: 0.4em 0.75em;
                box-shadow: none;
            }
        }
    }
</style>
