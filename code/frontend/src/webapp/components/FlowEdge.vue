<script setup lang="ts">
  import { MarkerType, SmoothStepEdge, type EdgeProps } from "@vue-flow/core";

  const props = defineProps<EdgeProps>();
</script>

<script lang="ts">
  export default {
    inheritAttrs: false
  };
</script>

<template>
  <SmoothStepEdge v-bind="props" :marker-end="`url('#${MarkerType.Arrow}')`" />
</template>

<style lang="scss"></style>
