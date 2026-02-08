<script setup lang="ts">
    import FlowNodeBox from "@/components/editor/graph/FlowNodeBox.vue";
    import {
        NODE_EDIT_DATA_TAB,
        NODE_EDIT_FUNCTION_TAB,
        NODE_EDIT_GENERAL_TAB,
        NODE_EDIT_STYLE_TAB,
        useNodeEditDialogStore
    } from "@/state/dialogs";
    import { useEditorStore } from "@/state/editor";
    import { useGraphStore } from "@/state/graph";

    import * as common from "@decision-support-ui/common";

    import { Position, Handle, useVueFlow } from "@vue-flow/core";
    import type { NodeProps } from "@vue-flow/core";
    import { NodeResizer } from "@vue-flow/node-resizer";
    import { NodeToolbar } from "@vue-flow/node-toolbar";

    import { computed } from "vue";

    const { getSelectedNodes, removeNodes } = useVueFlow();
    const nodeEditDialog = useNodeEditDialogStore();
    const graph = useGraphStore();
    const editor = useEditorStore();

    defineEmits<{
        (e: "updateNodeInternals"): void;
    }>();

    const flowNodeProps = defineProps<NodeProps>();

    const node = computed(() => graph.getComputedNode(flowNodeProps.id));
    const showToolbar = computed(
        () => getSelectedNodes.value.length == 1 && getSelectedNodes.value[0]?.id == flowNodeProps.id
    );

    const onResizeStart = () => {
        graph.history.pause();
    };

    const onResizeEnd = () => {
        graph.history.resume();
        graph.history.commit();
    };

    const extractSubgraph = (subgraphNodeId: common.NodeId) => {
        const subgraphNode = graph.getComputedNode(subgraphNodeId);
        const subgraphChildren = graph.getComputedSubgraphChildren(subgraphNodeId);
        const rootChildren = subgraphChildren.filter(n => n.nodeParentId == null);
        const centerPosition = common.getCenterPosition(rootChildren.map(n => n.visualization.position));
        const subgraphRootPosition = graph.getComputedNodeAncestors(subgraphNodeId).reduce(
            (p, n) => ({
                x: p.x + n.visualization.position.x,
                y: p.y + n.visualization.position.y
            }),
            { x: subgraphNode.visualization.position.x, y: subgraphNode.visualization.position.y } as common.Position
        );

        // move subgraph children
        for (const node of rootChildren) {
            node.visualization.position = {
                x: subgraphRootPosition.x + (node.visualization.position.x - centerPosition.x),
                y: subgraphRootPosition.y + (node.visualization.position.y - centerPosition.y)
            };
            node.nodeParentId = subgraphNode.nodeParentId;
        }

        // assign nodes to current subgraph
        for (const node of subgraphChildren) {
            node.subgraphParentId = editor.state.subgraphId;
        }

        // delete subgraph node
        graph.removeNodeAction(subgraphNodeId);
    };
</script>

<template>
    <NodeResizer
        :min-width="150"
        :min-height="50"
        :is-visible="flowNodeProps.selected"
        @resize-start="onResizeStart"
        @resize-end="onResizeEnd"
    />

    <NodeToolbar :is-visible="showToolbar" :position="Position.Top" class="nodrag nopan">
        <v-btn-group divided>
            <v-tooltip location="top" text="general information" open-delay="500">
                <template #activator="{ props }">
                    <v-btn
                        v-bind="props"
                        icon="mdi-information-outline"
                        @click="nodeEditDialog.openDialog(flowNodeProps.id, NODE_EDIT_GENERAL_TAB)"
                    ></v-btn>
                </template>
            </v-tooltip>
            <v-tooltip
                v-if="flowNodeProps.data.nodeType == common.VARIABLE_NODE_TYPE"
                location="top"
                text="function definition"
                open-delay="500"
            >
                <template #activator="{ props }">
                    <v-btn
                        v-bind="props"
                        icon="mdi-function"
                        @click="nodeEditDialog.openDialog(flowNodeProps.id, NODE_EDIT_FUNCTION_TAB)"
                    ></v-btn>
                </template>
            </v-tooltip>
            <v-tooltip
                v-if="
                    flowNodeProps.data.nodeType == common.VARIABLE_NODE_TYPE ||
                    flowNodeProps.data.nodeType == common.SUBGRAPH_NODE_TYPE
                "
                location="top"
                text="data visualization"
                open-delay="500"
            >
                <template #activator="{ props }">
                    <v-btn
                        v-bind="props"
                        icon="mdi-chart-histogram"
                        @click="nodeEditDialog.openDialog(flowNodeProps.id, NODE_EDIT_DATA_TAB)"
                    ></v-btn>
                </template>
            </v-tooltip>
            <v-tooltip
                v-if="flowNodeProps.data.nodeType == common.SUBGRAPH_NODE_TYPE"
                location="top"
                text="open subgraph"
                open-delay="500"
            >
                <template #activator="{ props }">
                    <v-btn v-bind="props" icon="mdi-exit-to-app" @click="editor.switchToSubgraph(node.id)"></v-btn>
                </template>
            </v-tooltip>
            <v-tooltip
                v-if="flowNodeProps.data.nodeType == common.SUBGRAPH_NODE_TYPE"
                location="top"
                text="extract subgraph"
                open-delay="500"
            >
                <template #activator="{ props }">
                    <v-btn v-bind="props" icon="mdi-call-split" @click="extractSubgraph(node.id)"></v-btn>
                </template>
            </v-tooltip>
            <v-tooltip location="top" text="node style options" open-delay="500">
                <template #activator="{ props }">
                    <v-btn
                        v-bind="props"
                        icon="mdi-palette-outline"
                        @click="nodeEditDialog.openDialog(flowNodeProps.id, NODE_EDIT_STYLE_TAB)"
                    ></v-btn>
                </template>
            </v-tooltip>
            <v-tooltip location="top" text="remove node" open-delay="500">
                <template #activator="{ props }">
                    <v-btn v-bind="props" icon="mdi-trash-can-outline" @click="removeNodes(flowNodeProps.id)"></v-btn>
                </template>
            </v-tooltip>
        </v-btn-group>
    </NodeToolbar>

    <FlowNodeBox
        :node-type="node.type"
        :function-type="node.function.type"
        :style-type="node.visualization.style.type"
        :custom-style="node.visualization.style.type == common.CUSTOM_STYLE_TYPE ? node.visualization.style : null"
    >
        {{ node.visualization.title }}
    </FlowNodeBox>

    <Handle id="top" type="source" :position="Position.Top" style="" />
    <Handle id="bottom" type="source" :position="Position.Bottom" />
    <Handle id="left" type="source" :position="Position.Left" style="" />
    <Handle id="right" type="source" :position="Position.Right" style="" />
</template>

<style lang="scss">
    $handle-size: 8px;
    $handle-shift: 2px;

    .vue-flow__node-toolbar {
        display: flex;
        gap: 0.5em;
        background: #fff;
        box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
        border: 1px solid #eee;
        border-radius: 0.5em;
    }

    .vue-flow__node {
        .vue-flow__handle {
            border-radius: 0;
            opacity: 0;
        }

        .vue-flow__handle-top {
            width: 80%;
            height: $handle-size;
            top: $handle-shift;
        }

        .vue-flow__handle-bottom {
            width: 80%;
            height: $handle-size;
            bottom: $handle-shift;
        }

        .vue-flow__handle-left {
            width: $handle-size;
            height: 80%;
            left: $handle-shift;
        }

        .vue-flow__handle-right {
            width: $handle-size;
            height: 80%;
            right: $handle-shift;
        }
    }
</style>
