<script setup lang="ts">
  import { ref } from "vue";

  import { VueFlow, Panel, useVueFlow, ConnectionMode, type GraphNode } from "@vue-flow/core";
  import { Background } from "@vue-flow/background";
  import { Controls } from "@vue-flow/controls";
  import { MiniMap } from "@vue-flow/minimap";

  import { useFlowStore } from "@/state/flow";
  import FlowNode from "./FlowNode.vue";
  import FlowEdge from "./FlowEdge.vue";
  import FlowNodeEditDialog from "./FlowNodeEditDialog.vue";

  const store = useFlowStore();

  const { onConnect, onEdgesChange, onNodesChange, onNodeDoubleClick, findNode, removeNodes } = useVueFlow();

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

  onConnect(connection => store.addVueFlowConnection(connection));

  // edit dialog
  const editDialogNode = ref<GraphNode | null>(null);

  onNodeDoubleClick(event => {
    editDialogNode.value = event.node;
  });

  const onNodeEditDialogClose = () => {
    editDialogNode.value = null;
  };

  const onToolbarEditNodeClick = (nodeId: string) => {
    editDialogNode.value = findNode(nodeId) ?? null;
  };
</script>

<template>
  <FlowNodeEditDialog :node="editDialogNode" @close="onNodeEditDialogClose" />
  <VueFlow
    :nodes="store.getVueFlowNodes"
    :edges="store.getVueFlowEdges"
    :connection-mode="ConnectionMode.Loose"
    fit-view-on-init
    snap-to-grid
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

    <Panel class="toolbar_panel" position="top-left">
      <v-toolbar title="Toolbar" :elevation="2" class="toolbar">
        <template #prepend> </template>
        <template #append>
          <v-btn icon="mdi-plus" text="add" @click="store.addNode"></v-btn>
          <v-btn icon="mdi-close-circle-outline" text="reset" @click="store.reset"></v-btn>
        </template>
      </v-toolbar>
    </Panel>

    <Controls />
    <MiniMap pannable zoomable position="top-right" />
    <Background variant="dots" />
  </VueFlow>
</template>

<style>
  @import "@vue-flow/core/dist/style.css";
  @import "@vue-flow/core/dist/theme-default.css";
  @import "@vue-flow/controls/dist/style.css";
  @import "@vue-flow/minimap/dist/style.css";
  @import "@vue-flow/node-resizer/dist/style.css";

  .vue-flow__panel.toolbar_panel {
    .toolbar {
      border-radius: 0.5em;
      background: #fff;

      .v-toolbar__content {
        gap: 1em;
      }
    }
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
