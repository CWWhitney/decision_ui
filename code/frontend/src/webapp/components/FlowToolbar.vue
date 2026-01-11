<script setup lang="ts">
  import { AVAILABLE_NODE_TYPES, DEFAULT_NODE_TYPE_TITLES, useFlowStore, type NodeTypes } from "@/state/flow";
  import { useVueFlow, type Rect } from "@vue-flow/core";

  const store = useFlowStore();
  const { fitView, screenToFlowCoordinate, getIntersectingNodes, zoomTo } = useVueFlow();

  const onNodeDragEnd = (event: DragEvent, nodeType: NodeTypes) => {
    const topleft = screenToFlowCoordinate({
      x: event.clientX,
      y: event.clientY
    });

    const intersectingNodes = getIntersectingNodes({ ...topleft, width: 1, height: 1 } as Rect, false);
    const parentNodeId = intersectingNodes.length == 1 ? intersectingNodes[0]?.id : null;

    store.addNode(nodeType, {
      position: { x: topleft.x - 100, y: topleft.y - 25 },
      dimensions: { width: 200, height: 50 },
      parentNodeId: parentNodeId
    });
  };

  const onNodeClick = (nodeType: NodeTypes) => {
    store.addNode(nodeType);
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
            icon="mdi-magnify-scan"
            variant="outlined"
            size="small"
            @click="() => zoomTo(1.0)"
          ></v-btn>
        </template>
      </v-tooltip>

      <v-tooltip location="bottom" text="change edge style" open-delay="500">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-vector-triangle"
            variant="outlined"
            size="small"
            @click="store.switchEdgeType"
          ></v-btn>
        </template>
      </v-tooltip>
    </div>
    <div class="toolbar_group">
      <div
        v-for="nodeType in AVAILABLE_NODE_TYPES"
        :key="nodeType"
        :class="`vue-flow__node ${nodeType}`"
        :draggable="true"
        @click="() => onNodeClick(nodeType)"
        @dragend="event => onNodeDragEnd(event, nodeType)"
      >
        <div class="content">{{ DEFAULT_NODE_TYPE_TITLES[nodeType] }}</div>
      </div>
    </div>
    <div class="toolbar_group">
      <p>Debug:</p>
      <v-btn prepend-icon="mdi-close-circle-outline" variant="outlined" text="reset" @click="store.reset">Reset</v-btn>
    </div>
  </div>
</template>

<style lang="scss">
  .flowpage_toolbar {
    display: flex;
    gap: 0.5em;
    justify-content: space-between;

    background: #fff;
    padding: 0.5em;

    .toolbar_group {
      display: flex;
      align-items: center;
      gap: 0.5em;
      background: #fff;
    }

    .vue-flow__node {
      position: relative;
      min-width: 5em;

      .content {
        padding: 0.5em 0.75em;
      }
    }
  }
</style>
