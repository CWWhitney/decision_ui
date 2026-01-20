<script setup lang="ts">
    import type { Chart } from "chart.js";
    import { onBeforeUnmount, onMounted, onUpdated, ref, useTemplateRef } from "vue";
    import { drawNodeEditDialogSeriesPlot } from "../../charts/histogram/nodeEditDialog";

    const { means, stddevs } = defineProps<{ means: number[]; stddevs: number[] }>();

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

    const drawSeriesChart = () => {
        const ctx = getCanvasContext();
        if (ctx == null) {
            // no canvas context
            return;
        }
        graph.value = drawNodeEditDialogSeriesPlot(graph.value, ctx, means, stddevs);
    };

    onMounted(() => {
        drawSeriesChart();
    });

    onUpdated(() => {
        drawSeriesChart();
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
