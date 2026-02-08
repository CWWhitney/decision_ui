<script setup lang="ts">
    import {
        VueFlow,
        useVueFlow,
        ConnectionMode,
        type NodeRemoveChange,
        type NodeChange,
        type Connection,
        type EdgeChange,
        type NodeMouseEvent,
        type ViewportTransform
    } from "@vue-flow/core";
    import { Background } from "@vue-flow/background";
    import { MiniMap } from "@vue-flow/minimap";

    import * as common from "@decision-support-ui/common";

    import { useGraphStore } from "@/state/graph";
    import { NODE_EDIT_FUNCTION_TAB, useNodeEditDialogStore } from "@/state/dialogs";
    import { ref, watch } from "vue";
    import { useEditorStore } from "@/state/editor";

    import FlowNode from "./graph/FlowNode.vue";
    import FlowEdge from "./graph/FlowEdge.vue";
    import NodeEditDialog from "./dialogs/NodeEditDialog.vue";
    import EditorToolbar from "./EditorToolbar.vue";
    import FlowShortcuts from "./EditorShortcuts.vue";
    import EditorSubgraphIndicator from "./EditorSubgraphIndicator.vue";

    const graph = useGraphStore();
    const editor = useEditorStore();
    const nodeEditStore = useNodeEditDialogStore();

    const { applyNodeChanges, applyEdgeChanges, setInteractive, removeSelectedNodes, getSelectedNodes, setViewport } =
        useVueFlow("editor");

    // disable history while moving
    const onNodeDragStart = () => {
        graph.history.pause();
    };

    const onNodeDragStop = () => {
        graph.history.resume();
        graph.history.commit();
    };

    // edge events
    const onEdgesChange = (changes: EdgeChange[]) => {
        for (const change of changes) {
            if (change.type == "remove" && change.id) {
                graph.removeEdgeAction(change.id);
            }
        }
        applyEdgeChanges(changes);
    };

    // node events
    const onNodesChange = (changes: NodeChange[]) => {
        const additionalNodeChanges: NodeChange[] = [];
        for (const change of changes) {
            if (change.type == "remove" && change.id) {
                for (const node of graph.getComputedNodeDescendants(change.id)) {
                    additionalNodeChanges.push({
                        type: "remove",
                        id: node.id
                    } as NodeRemoveChange);
                }
                graph.removeNodeAction(change.id);
            }
            if (change.type == "position" && change.id && change.position) {
                graph.updateNodePositionAction(change.id, change.position);
            }
            if (change.type == "dimensions" && change.id && change.dimensions) {
                graph.updateNodeSizeAction(change.id, change.dimensions);
            }
        }
        applyNodeChanges([...changes, ...additionalNodeChanges]);
    };

    const onConnect = (connection: Connection) => graph.addEdgeFromVueFlowConnectionAction(connection);

    const onNodeDoubleClick = (event: NodeMouseEvent) => {
        if (!editor.locked) {
            const node = graph.getComputedNode(event.node.id);
            if (node.type == common.VARIABLE_NODE_TYPE) {
                nodeEditStore.openDialog(event.node.id, NODE_EDIT_FUNCTION_TAB);
            } else if (node.type == common.COLLECTION_NODE_TYPE) {
                nodeEditStore.openDialog(event.node.id);
            } else if (node.type == common.SUBGRAPH_NODE_TYPE) {
                editor.switchToSubgraph(node.id);
            }
        }
    };

    const onViewportChangeEnd = (viewportChange: ViewportTransform) => {
        editor.updateViewport(viewportChange);
    };

    watch(editor, options => {
        if (options.locked) {
            removeSelectedNodes(getSelectedNodes.value);
            setInteractive(false);
        } else {
            setInteractive(true);
        }

        // update viewport from state
        setViewport(editor.computedViewportState);
    });

    const focused = ref<boolean>(false);
</script>

<template>
    <div class="container">
        <EditorToolbar />
        <FlowShortcuts :focused="focused" />

        <div class="vueFlowContainer">
            <VueFlow
                :nodes="editor.computedVueFlowNodes"
                :edges="editor.computedVueFlowEdges"
                :connection-mode="ConnectionMode.Loose"
                :snap-to-grid="editor.snapToGrid"
                :snap-grid="[10, 10]"
                :apply-default="false"
                :zoom-on-double-click="false"
                :min-zoom="0.1"
                elevate-edges-on-select
                tabindex="0"
                @connect="onConnect"
                @node-drag-start="onNodeDragStart"
                @node-drag-stop="onNodeDragStop"
                @edges-change="onEdgesChange"
                @nodes-change="onNodesChange"
                @node-double-click="onNodeDoubleClick"
                @viewport-change-end="onViewportChangeEnd"
                @focus="focused = true"
                @blur="focused = false"
            >
                <!-- bind your custom node type to a component by using slots, slot names are always `node-<type>` -->
                <template #node-custom="nodeProps">
                    <FlowNode v-bind="nodeProps" />
                </template>

                <!-- bind your custom edge type to a component by using slots, slot names are always `edge-<type>` -->
                <template #edge-custom="edgeProps">
                    <FlowEdge v-bind="edgeProps" />
                </template>

                <MiniMap v-if="false" pannable zoomable position="top-right" />
                <Background v-if="editor.background != 'none'" :variant="editor.background" />
            </VueFlow>
            <EditorSubgraphIndicator />
        </div>
    </div>
    <NodeEditDialog />
</template>

<style lang="scss">
    @import "@vue-flow/core/dist/style.css";
    @import "@vue-flow/core/dist/theme-default.css";
    @import "@vue-flow/minimap/dist/style.css";
    @import "@vue-flow/node-resizer/dist/style.css";

    .vue-flow {
        flex-grow: 1;
    }

    .vue-flow__panel.vue-flow__minimap {
        display: block;

        border: 2px solid #ddd;
        background: #fff;

        svg {
            display: block;
        }
    }
</style>

<style lang="scss" scoped>
    .container {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
    }

    .vueFlowContainer {
        position: relative;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        height: 100%;
        width: 100%;
    }
</style>
