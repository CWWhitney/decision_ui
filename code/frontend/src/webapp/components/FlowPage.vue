<script setup lang="ts">
  import { VueFlow, Panel, useVueFlow, ConnectionMode, type NodeRemoveChange, type NodeChange } from "@vue-flow/core";
  import { Background } from "@vue-flow/background";
  import { Controls } from "@vue-flow/controls";
  import { MiniMap } from "@vue-flow/minimap";

  import FlowNode from "./FlowNode.vue";
  import FlowEdge from "./FlowEdge.vue";
  import FlowNodeEditDialog from "./FlowNodeEditDialog.vue";
  import FlowToolbar from "./FlowToolbar.vue";

  import { useFlowOptionsStore } from "@/state/flow/options";
  import { useFlowGraphStore } from "@/state/flow/graph";
  import { useDialogsNodeEditStore } from "@/state/dialogs/nodeEdit";
  import { useFlowStyleStore } from "@/state/flow/style";

  const optionsStore = useFlowOptionsStore();
  const graphStore = useFlowGraphStore();
  const styleStore = useFlowStyleStore();
  const nodeEditStore = useDialogsNodeEditStore();

  const { onConnect, onEdgesChange, onNodesChange, onNodeDoubleClick, applyNodeChanges, applyEdgeChanges } =
    useVueFlow();

  // edge events
  onEdgesChange(changes => {
    for (const change of changes) {
      if (change.type == "remove" && change.id) {
        graphStore.removeEdge(change.id);
      }
    }
    applyEdgeChanges(changes);
  });

  // node events
  onNodesChange(changes => {
    const additionalNodeChanges: NodeChange[] = [];
    for (const change of changes) {
      if (change.type == "remove" && change.id) {
        for (const node of graphStore.getDescendantNodes(graphStore.getNode(change.id).value).value) {
          additionalNodeChanges.push({
            type: "remove",
            id: node.id
          } as NodeRemoveChange);
        }
        graphStore.removeNode(change.id);
      }
      if (change.type == "position" && change.id && change.position) {
        graphStore.updateNodePosition(change.id, change.position);
      }
      if (change.type == "dimensions" && change.id && change.dimensions) {
        graphStore.updateNodeDimensions(change.id, change.dimensions);
      }
    }
    applyNodeChanges([...changes, ...additionalNodeChanges]);
  });

  onConnect(connection => graphStore.addEdgeFromVueFlowConnection(connection));

  onNodeDoubleClick(event => {
    if (!optionsStore.locked) {
      nodeEditStore.openDialog(event.node.id);
    }
  });
</script>

<template>
  <div class="flowpage_container">
    <FlowToolbar />
    <VueFlow
      :nodes="graphStore.getVueFlowNodes().value"
      :edges="graphStore.getVueFlowEdges().value"
      :connection-mode="ConnectionMode.Loose"
      :snap-to-grid="optionsStore.snapToGrid"
      :snap-grid="[10, 10]"
      :apply-default="false"
      :zoom-on-double-click="false"
      :min-zoom="0.4"
      elevate-edges-on-select
    >
      <!-- bind your custom node type to a component by using slots, slot names are always `node-<type>` -->
      <template #node-custom="nodeProps">
        <FlowNode v-bind="nodeProps" />
      </template>

      <!-- bind your custom edge type to a component by using slots, slot names are always `edge-<type>` -->
      <template #edge-custom="edgeProps">
        <FlowEdge v-bind="edgeProps" />
      </template>

      <Panel class="toolbar_panel" position="top-left"> </Panel>

      <Controls v-if="false" />
      <MiniMap v-if="false" pannable zoomable position="top-right" />
      <Background v-if="styleStore.background != 'none'" :variant="styleStore.background" />
    </VueFlow>
  </div>
  <FlowNodeEditDialog />
</template>

<style>
  @import "@vue-flow/core/dist/style.css";
  @import "@vue-flow/core/dist/theme-default.css";
  @import "@vue-flow/controls/dist/style.css";
  @import "@vue-flow/minimap/dist/style.css";
  @import "@vue-flow/node-resizer/dist/style.css";

  .flowpage_container {
    display: flex;
    flex-direction: column;
    height: 100%;
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
