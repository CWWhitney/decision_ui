<script setup lang="ts">
    import { BezierEdge, MarkerType, SmoothStepEdge, StraightEdge, type EdgeProps } from "@vue-flow/core";
    import * as common from "@decision-support-ui/common";

    import { useEditorStore } from "../../../state/editor";

    const editorSettings = useEditorStore();
    const props = defineProps<EdgeProps>();
</script>

<script lang="ts">
    export default {
        inheritAttrs: false
    };
</script>

<template>
    <SmoothStepEdge
        v-if="editorSettings.persisted.edgeStyle == common.SMOOTH_STEP_EDGE_STYLE_TYPE"
        v-bind="props"
        :marker-end="`url('#${MarkerType.Arrow}')`"
    />
    <BezierEdge
        v-if="editorSettings.persisted.edgeStyle == common.BEZIER_EDGE_STYLE_TYPE"
        v-bind="props"
        :marker-end="`url('#${MarkerType.Arrow}')`"
    />
    <StraightEdge
        v-if="editorSettings.persisted.edgeStyle == common.STRAIGHT_EDGE_STYLE_TYPE"
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
            stroke: #777;
        }
    }
</style>
