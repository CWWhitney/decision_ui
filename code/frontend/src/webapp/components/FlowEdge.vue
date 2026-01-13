<script setup lang="ts">
  import { useStore } from "@/state";
  import { BEZIER_EDGE_TYPE, SMOOTH_STEP_EDGE_TYPE, STRAIGHT_EDGE_TYPE } from "@/state/flow/style";
  import { BezierEdge, MarkerType, SmoothStepEdge, StraightEdge, type EdgeProps } from "@vue-flow/core";
  import { computed } from "vue";

  const store = useStore();
  const edgeType = computed(() => store.flow.style.edgeType);
  const props = defineProps<EdgeProps>();
</script>

<script lang="ts">
  export default {
    inheritAttrs: false
  };
</script>

<template>
  <SmoothStepEdge v-if="edgeType == SMOOTH_STEP_EDGE_TYPE" v-bind="props" :marker-end="`url('#${MarkerType.Arrow}')`" />
  <BezierEdge v-if="edgeType == BEZIER_EDGE_TYPE" v-bind="props" :marker-end="`url('#${MarkerType.Arrow}')`" />
  <StraightEdge v-if="edgeType == STRAIGHT_EDGE_TYPE" v-bind="props" :marker-end="`url('#${MarkerType.Arrow}')`" />
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
