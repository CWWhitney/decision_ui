<script setup lang="ts">
    import type { Chart } from "chart.js";
    import { onBeforeUnmount, onMounted, onUpdated, ref, useTemplateRef } from "vue";
    import { drawProbabilisticSeriesChart } from "../../charts/series";
    import { downloadChart } from "../../charts/download";
    import ChartDownloadButtons from "./ChartDownloadButtons.vue";
    import { CHART_DOWNLOAD_DPR } from "@/common/constants";

    const { means, stddevs, label } = defineProps<{ means: number[]; stddevs: number[]; label: string }>();

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

    const drawSeriesChart = (dpr: number = window.devicePixelRatio) => {
        const ctx = getCanvasContext();
        if (ctx == null) {
            // no canvas context
            return;
        }
        graph.value = drawProbabilisticSeriesChart(graph.value, ctx, means, stddevs, label, dpr);
    };

    const download = (filetype: string) => {
        downloadChart(
            dpr => {
                drawSeriesChart(dpr);
                return canvas.value;
            },
            label,
            filetype,
            CHART_DOWNLOAD_DPR
        );
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
    <div class="container">
        <ChartDownloadButtons :download="download" />
        <div class="canvasContainer">
            <canvas ref="canvas" class="canvas" />
        </div>
    </div>
</template>

<style scoped lang="scss">
    .container {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
    }

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
