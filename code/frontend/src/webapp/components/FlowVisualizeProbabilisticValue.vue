<script setup lang="ts">
    import type { Chart } from "chart.js";
    import { onBeforeUnmount, onMounted, onUpdated, ref, useTemplateRef } from "vue";
    import { drawNodeEditDialogHistogram } from "../charts/histogram/nodeEditDialog";

    const { bins, counts } = defineProps<{ bins: number[]; counts: number[] }>();

    const canvas = useTemplateRef<HTMLCanvasElement | null>("canvas");
    const graph = ref<Chart<"bar"> | Chart<any> | null>(null);

    const getCanvasContext = () => {
        if (!canvas.value) {
            // canvas not mounted yet
            return null;
        }

        const ctx = canvas.value.getContext("2d");
        if (!ctx) {
            // canvas not ready or not supported
            return null;
        }

        return ctx;
    };

    const drawProbabilisticChart = () => {
        const ctx = getCanvasContext();
        if (ctx == null) {
            // no canvas context
            return;
        }
        graph.value = drawNodeEditDialogHistogram(graph.value, ctx, bins, counts);
    };

    onMounted(() => {
        drawProbabilisticChart();
    });

    onUpdated(() => {
        drawProbabilisticChart();
    });

    onBeforeUnmount(() => {
        if (graph.value) {
            graph.value.destroy();
        }
    });
</script>

<template>
    <div class="canvasContainer">
        <canvas ref="canvas" />
    </div>
</template>

<style scoped lang="scss">
    .canvasContainer {
        aspect-ratio: 1.41;
        flex-grow: 1;
        overflow: hidden;

        width: 100%;
        position: relative;
    }
</style>
