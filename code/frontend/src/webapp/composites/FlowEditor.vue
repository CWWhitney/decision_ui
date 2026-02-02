<script setup lang="ts">
    import { VueFlow, useVueFlow, ConnectionMode, type NodeRemoveChange, type NodeChange } from "@vue-flow/core";
    import { Background } from "@vue-flow/background";
    import { MiniMap } from "@vue-flow/minimap";

    import FlowNode from "./FlowNode.vue";
    import FlowEdge from "./FlowEdge.vue";
    import FlowNodeEditDialog from "./FlowNodeEditDialog.vue";
    import FlowToolbar from "./FlowToolbar.vue";

    import { useFlowGraphStore } from "@/state/graph";
    import { useDialogsNodeEditStore } from "@/state/dialogs";
    import { ref, watch } from "vue";
    import FlowShortcuts from "./FlowShortcuts.vue";
    import { useEditorSettingsStore } from "@/state/settings";

    const graphStore = useFlowGraphStore();
    const editorSettings = useEditorSettingsStore();
    const nodeEditStore = useDialogsNodeEditStore();

    const {
        onConnect,
        onEdgesChange,
        onNodesChange,
        onNodeDoubleClick,
        applyNodeChanges,
        applyEdgeChanges,
        setInteractive,
        removeSelectedNodes,
        getSelectedNodes,
        onNodeDragStart,
        onNodeDragStop
    } = useVueFlow("editor");

    // disable history while moving
    onNodeDragStart(() => {
        graphStore.history.pause();
    });

    onNodeDragStop(() => {
        graphStore.history.resume();
        graphStore.history.commit();
    });

    // edge events
    onEdgesChange(changes => {
        for (const change of changes) {
            if (change.type == "remove" && change.id) {
                graphStore.removeEdgeAction(change.id);
            }
        }
        applyEdgeChanges(changes);
    });

    // node events
    onNodesChange(changes => {
        const additionalNodeChanges: NodeChange[] = [];
        for (const change of changes) {
            if (change.type == "remove" && change.id) {
                for (const node of graphStore.getComputedDescendantNodes(change.id).value) {
                    additionalNodeChanges.push({
                        type: "remove",
                        id: node.id
                    } as NodeRemoveChange);
                }
                graphStore.removeNodeAction(change.id);
            }
            if (change.type == "position" && change.id && change.position) {
                graphStore.updateNodePositionAction(change.id, change.position);
            }
            if (change.type == "dimensions" && change.id && change.dimensions) {
                graphStore.updateNodeSizeAction(change.id, change.dimensions);
            }
        }
        applyNodeChanges([...changes, ...additionalNodeChanges]);
    });

    onConnect(connection => graphStore.addEdgeFromVueFlowConnectionAction(connection));

    onNodeDoubleClick(event => {
        if (!editorSettings.locked) {
            nodeEditStore.openDialog(event.node.id);
        }
    });

    watch(editorSettings, options => {
        if (options.locked) {
            removeSelectedNodes(getSelectedNodes.value);
            setInteractive(false);
        } else {
            setInteractive(true);
        }
    });

    const focused = ref<boolean>(false);
</script>

<template>
    <div class="container">
        <FlowToolbar />
        <FlowShortcuts :focused="focused" />
        <VueFlow
            :nodes="graphStore.getComputedVueFlowNodes().value"
            :edges="graphStore.getComputedVueFlowEdges().value"
            :connection-mode="ConnectionMode.Loose"
            :snap-to-grid="editorSettings.snapToGrid"
            :snap-grid="[10, 10]"
            :apply-default="false"
            :zoom-on-double-click="false"
            :min-zoom="0.4"
            elevate-edges-on-select
            tabindex="0"
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
            <Background v-if="editorSettings.background != 'none'" :variant="editorSettings.background" />
        </VueFlow>
    </div>
    <FlowNodeEditDialog />
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
</style>
