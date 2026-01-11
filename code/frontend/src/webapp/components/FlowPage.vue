<script setup lang="ts">
  import { VueFlow, Panel, useVueFlow, ConnectionMode } from "@vue-flow/core";
  import { Background } from "@vue-flow/background";
  import { Controls } from "@vue-flow/controls";
  import { MiniMap } from "@vue-flow/minimap";

  import { useFlowStore } from "@/state/flow";
  import FlowNode from "./FlowNode.vue";
  import FlowEdge from "./FlowEdge.vue";
  import FlowNodeEditDialog from "./FlowNodeEditDialog.vue";
  import FlowToolbar from "./FlowToolbar.vue";

  const store = useFlowStore();

  const { onConnect, onEdgesChange, onNodesChange, onNodeDoubleClick, removeNodes } = useVueFlow();

  // edge events
  onEdgesChange(changes => {
    for (const change of changes) {
      if (change.type == "remove" && change.id) {
        store.removeEdge(change.id);
      }
    }
  });

  // node events
  onNodesChange(changes => {
    for (const change of changes) {
      if (change.type == "remove" && change.id) {
        store.removeNode(change.id);
      }
      if (change.type == "position" && change.id && change.position) {
        store.updateNodePosition(change.id, change.position);
      }
      if (change.type == "dimensions" && change.id && change.dimensions) {
        store.updateNodeDimensions(change.id, change.dimensions);
      }
    }
  });

  const onToolbarRemoveNodeClick = (nodeId: string) => {
    removeNodes(nodeId);
  };

  onConnect(connection => store.addEdgeFromVueFlowConnection(connection));

  onNodeDoubleClick(event => {
    store.openNodeEditDialog(event.node.id);
  });

  const onToolbarEditNodeClick = (nodeId: string) => {
    store.openNodeEditDialog(nodeId);
  };
</script>

<template>
  <div class="flowpage_container">
    <FlowToolbar />
    <VueFlow
      :nodes="store.getVueFlowNodes"
      :edges="store.getVueFlowEdges"
      :connection-mode="ConnectionMode.Loose"
      fit-view-on-init
      snap-to-grid
      elevate-edges-on-select
    >
      <!-- bind your custom node type to a component by using slots, slot names are always `node-<type>` -->
      <template #node-custom="nodeProps">
        <FlowNode
          v-bind="nodeProps"
          @toolbar-edit-node-click="onToolbarEditNodeClick"
          @toolbar-remove-node-click="onToolbarRemoveNodeClick"
        />
      </template>

      <!-- bind your custom edge type to a component by using slots, slot names are always `edge-<type>` -->
      <template #edge-custom="edgeProps">
        <FlowEdge v-bind="edgeProps" />
      </template>

      <Panel class="toolbar_panel" position="top-left"> </Panel>

      <Controls v-if="false" />
      <MiniMap v-if="false" pannable zoomable position="top-right" />
      <Background variant="dots" />
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
