<script setup lang="ts">
  import * as tf from "@tensorflow/tfjs";

  import { useFlowGraphStore } from "@/state/flow/graph";
  import { type Node } from "@decision-support-ui/common";
  import { computedAsync } from "@vueuse/core";
  import { computed } from "vue";

  const node = defineModel<Node>({ required: true });
  const graphStore = useFlowGraphStore();

  const variableDependencies = computed(() => graphStore.getComputedVariableDependencies(node.value.id).value);
  const computedValue = computedAsync(async () => await graphStore.getComputedComputationResult(node.value.id).value);
</script>

<template>
  <p v-if="variableDependencies.type == 'success'">
    Variable Dependencies: {{ JSON.stringify(variableDependencies.list) }}
  </p>
  <p>Computed Data:</p>
  <pre>{{ JSON.stringify(computedValue, null, 2) }}</pre>
  <p>Tensorflow Memory:</p>
  <pre>{{ JSON.stringify(tf.memory(), null, 2) }}</pre>
</template>

<style scoped lang="scss"></style>
