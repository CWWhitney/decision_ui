<script setup lang="ts">
  import { ESTIMATE_NODE_TYPE, type Node } from "@decision-support-ui/common";

  const node = defineModel<Node>({ required: true });
</script>

<template>
  <v-text-field v-model="node.visualization.title" label="Title" required></v-text-field>
  <div v-if="node.type == ESTIMATE_NODE_TYPE">
    <v-text-field v-model="node.options.comment" label="Comment for Estimate in CSV"></v-text-field>
  </div>
</template>

<style scoped lang="scss">
  .v-text-field {
    min-width: 18em;
  }
</style>
