<script setup lang="ts">
    import * as common from "@decision-support-ui/common";
    import { computedAsync } from "@vueuse/core";

    import FlowVisualizeDeterministicValue from "./FlowVisualizeDeterministicValue.vue";
    import FlowVisualizeProbabilisticSeries from "./FlowVisualizeProbabilisticSeries.vue";
    import FlowVisualizeProbabilisticValue from "./FlowVisualizeProbabilisticValue.vue";
    import FlowVisualizeDeterministicSeries from "./FlowVisualizeDeterministicSeries.vue";

    const {
        nodeTitle,
        isProbabilistic,
        isSeries,
        getDeterministicValue,
        getHistogramData,
        getProbabilisticSeriesPlotData,
        getDeterministicSeriesPlotData
    } = defineProps<{
        nodeTitle: string;
        isProbabilistic: boolean;
        isSeries: boolean;
        getDeterministicValue: () => Promise<common.ComputedResult<number>>;
        getHistogramData: () => Promise<common.ComputedResult<common.HistogramData>>;
        getDeterministicSeriesPlotData: () => Promise<common.ComputedResult<common.DeterministicSeriesPlotData>>;
        getProbabilisticSeriesPlotData: () => Promise<common.ComputedResult<common.ProbabilisticSeriesPlotData>>;
    }>();

    const deterministicValue = computedAsync(async () => {
        if (!isProbabilistic && !isSeries) {
            return await getDeterministicValue();
        }
    });

    const histogramData = computedAsync(async () => {
        if (isProbabilistic && !isSeries) {
            return await getHistogramData();
        }
    });

    const probabilisticSeriesPlotData = computedAsync(async () => {
        if (isSeries && isProbabilistic) {
            return await getProbabilisticSeriesPlotData();
        }
    });

    const deterministicSeriesPlotData = computedAsync(async () => {
        if (isSeries && !isProbabilistic) {
            return await getDeterministicSeriesPlotData();
        }
    });
</script>

<template>
    <template v-if="deterministicValue && deterministicValue.type == 'success'">
        <FlowVisualizeDeterministicValue :value="deterministicValue.value" />
    </template>
    <template v-if="histogramData && histogramData.type == 'success'">
        <FlowVisualizeProbabilisticValue
            :bins="histogramData.value.bins"
            :counts="histogramData.value.counts"
            :label="nodeTitle"
        />
    </template>
    <template v-if="probabilisticSeriesPlotData && probabilisticSeriesPlotData.type == 'success'">
        <FlowVisualizeProbabilisticSeries
            :means="probabilisticSeriesPlotData.value.means"
            :stddevs="probabilisticSeriesPlotData.value.stddevs"
            :label="nodeTitle"
        />
    </template>
    <template v-if="deterministicSeriesPlotData && deterministicSeriesPlotData.type == 'success'">
        <FlowVisualizeDeterministicSeries :values="deterministicSeriesPlotData.value.values" :label="nodeTitle" />
    </template>
</template>

<style scoped lang="scss"></style>
