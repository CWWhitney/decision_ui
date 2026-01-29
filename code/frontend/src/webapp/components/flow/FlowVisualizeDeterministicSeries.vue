<script setup lang="ts">
    import type { Chart } from "chart.js";
    import { onBeforeUnmount, onMounted, onUpdated, ref, useTemplateRef } from "vue";
    import { drawProbabilisticSeriesChart } from "../../charts/histogram/nodeEditDialog";

    const { values, label } = defineProps<{ values: number[]; label: string }>();

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
        graph.value = drawProbabilisticSeriesChart(graph.value, ctx, values, Array(values.length).fill(0), label);
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
        <canvas ref="canvas" class="canvas" />
    </div>
</template>

<style scoped lang="scss">
    .canvasContainer {
        flex-grow: 1;
        height: 100%;
        width: 100%;
        overflow: hidden;
        position: relative;
        min-width: 30em;
        min-height: 20em;
    }

    .canvas {
        position: absolute;
    }
</style>
