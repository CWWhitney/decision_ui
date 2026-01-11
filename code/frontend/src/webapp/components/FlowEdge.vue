<script setup lang="ts">
  import { useFlowStore } from "@/state/flow";
  import { BezierEdge, MarkerType, SmoothStepEdge, StraightEdge, type EdgeProps } from "@vue-flow/core";

  const store = useFlowStore();

  const props = defineProps<EdgeProps>();
</script>

<script lang="ts">
  export default {
    inheritAttrs: false
  };
</script>

<template>
  <SmoothStepEdge
    v-if="store.graph.style.edgeType == 'smooth-step'"
    v-bind="props"
    :marker-end="`url('#${MarkerType.Arrow}')`"
  />
  <BezierEdge
    v-if="store.graph.style.edgeType == 'bezier'"
    v-bind="props"
    :marker-end="`url('#${MarkerType.Arrow}')`"
  />
  <StraightEdge
    v-if="store.graph.style.edgeType == 'straight'"
    v-bind="props"
    :marker-end="`url('#${MarkerType.Arrow}')`"
  />
</template>

<style lang="scss">
  .vue-flow__arrowhead {
    polyline {
      stroke: #333 !important;
    }
  }

  .vue-flow__edge {
    &.selected {
      .vue-flow__edge-path {
        stroke-width: 2.5px;
      }
    }

    .vue-flow__edge-path {
      stroke-width: 1.5px;
      stroke-linecap: round;
      stroke: #333;
    }
  }
</style>
