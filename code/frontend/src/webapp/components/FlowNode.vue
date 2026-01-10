<script setup lang="ts">
  import { Position, Handle } from "@vue-flow/core";
  import type { NodeProps } from "@vue-flow/core";
  import { NodeResizer } from "@vue-flow/node-resizer";
  import { NodeToolbar } from "@vue-flow/node-toolbar";

  const props = defineProps<NodeProps>();

  const emit = defineEmits<{
    (e: "toolbarEditNodeClick", nodeId: string): void;
    (e: "toolbarRemoveNodeClick", nodeId: string): void;
  }>();

  const onToolbarNodeEditClick = () => {
    emit("toolbarEditNodeClick", props.id);
  };

  const onToolbarRemoveNodeClick = () => {
    emit("toolbarRemoveNodeClick", props.id);
  };
</script>

<template>
  <NodeResizer :min-width="150" :min-height="50" :is-visible="props.selected" />

  <NodeToolbar :is-visible="props.selected" :position="Position.Top">
    <v-btn-group divided>
      <v-btn icon="mdi-square-edit-outline" @click="onToolbarNodeEditClick"></v-btn>
      <v-btn icon="mdi-palette-outline"></v-btn>
      <v-btn icon="mdi-trash-can-outline" @click="onToolbarRemoveNodeClick"></v-btn>
    </v-btn-group>
  </NodeToolbar>

  <div class="content">{{ props.data.label }}</div>

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
      border: 1.5px solid #000;
      border-radius: 0.5em;
      background-color: #fff;

      padding: 0.75em;
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
