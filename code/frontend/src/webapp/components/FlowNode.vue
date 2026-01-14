<script setup lang="ts">
  import {
    NODE_EDIT_DATA_TAB,
    NODE_EDIT_DEBUG_TAB,
    NODE_EDIT_FUNCTION_TAB,
    NODE_EDIT_GENERAL_TAB,
    NODE_EDIT_STYLE_TAB,
    useDialogsNodeEditStore
  } from "@/state/dialogs/nodeEdit";
  import { Position, Handle, useVueFlow } from "@vue-flow/core";
  import type { NodeProps } from "@vue-flow/core";
  import { NodeResizer } from "@vue-flow/node-resizer";
  import { NodeToolbar } from "@vue-flow/node-toolbar";
  import { computed } from "vue";

  const { getSelectedNodes, removeNodes } = useVueFlow();
  const nodeEditStore = useDialogsNodeEditStore();

  defineEmits<{
    (e: "updateNodeInternals"): void;
  }>();

  const node = defineProps<NodeProps>();
  const showToolbar = computed(() => getSelectedNodes.value.length == 1 && getSelectedNodes.value[0]?.id == node.id);
</script>

<template>
  <NodeResizer :min-width="150" :min-height="50" :is-visible="node.selected" />

  <NodeToolbar :is-visible="showToolbar" :position="Position.Top">
    <v-btn-group divided>
      <v-btn icon="mdi-information-outline" @click="nodeEditStore.openDialog(node.id, NODE_EDIT_GENERAL_TAB)"></v-btn>
      <v-btn icon="mdi-function" @click="nodeEditStore.openDialog(node.id, NODE_EDIT_FUNCTION_TAB)"></v-btn>
      <v-btn icon="mdi-chart-histogram" @click="nodeEditStore.openDialog(node.id, NODE_EDIT_DATA_TAB)"></v-btn>
      <v-btn icon="mdi-palette-outline" @click="nodeEditStore.openDialog(node.id, NODE_EDIT_STYLE_TAB)"></v-btn>
      <v-btn icon="mdi-bug-outline" @click="nodeEditStore.openDialog(node.id, NODE_EDIT_DEBUG_TAB)"></v-btn>
      <v-btn icon="mdi-trash-can-outline" @click="removeNodes(node.id)"></v-btn>
    </v-btn-group>
  </NodeToolbar>

  <div class="content">{{ node.data.label }}</div>

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
    .content {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 0.75em;
      overflow: hidden;
    }

    &.estimate .content {
      background-color: rgba(135, 238, 238, 0.8);
      border: 1.5px solid #2e8e8e;
    }

    &.operation .content {
      background-color: rgba(250, 250, 250, 0.8);
      border: 1.5px solid #333;
      border-radius: 0.5em;
    }

    &.loop .content {
      background-color: rgba(212, 212, 212, 0.8);
      border: 1.5px solid #5e5e5e;
      border-radius: 0.5em;
    }

    &.result .content {
      background-color: rgba(235, 168, 235, 0.8);
      border: 1.5px solid #ac31ac;
    }

    &.collection .content {
      background-color: rgba(209, 209, 209, 0.2);
      border-radius: 0.5em;
      border: 1.5px dashed #828282;
    }

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
