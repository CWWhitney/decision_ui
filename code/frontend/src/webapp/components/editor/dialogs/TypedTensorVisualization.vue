<script setup lang="ts">
    import * as common from "@decision-support-ui/common";
    import * as tf from "@tensorflow/tfjs";
    import { computedAsync } from "@vueuse/core";
    import { ref } from "vue";

    import DeterministicValueChart from "../../charts/DeterministicValueChart.vue";
    import ProbabilisticSeriesChart from "../../charts/ProbabilisticSeriesChart.vue";
    import ProbabilisticValueChart from "../../charts/ProbabilisticValueChart.vue";
    import DeterministicSeriesChart from "../../charts/DeterministicSeriesChart.vue";

    const { nodeTitle, tt, bins } = defineProps<{
        nodeTitle: string;
        tt: common.TypedTensor;
        bins: number;
    }>();

    const probabilisticSeriesMode = ref<"full" | "sample" | "timestep">("full");
    const sampleId = ref<number>(0);
    const timestepId = ref<number>(0);

    const deterministicValue = computedAsync(async () => {
        if (!tt.isProbabilistic && !tt.isSeries) {
            return (await tt.tensor.array()) as number;
        }
        return null;
    });

    const histogramData = computedAsync(async () => {
        if (tt.isProbabilistic && !tt.isSeries) {
            return await common.getHistogramBinsFromTensor(tt.tensor, bins);
        }
        return null;
    });

    const deterministicSeriesPlotData = computedAsync(async () => {
        if (tt.isSeries && !tt.isProbabilistic) {
            return await common.getDeterministicSeriesPlotDataFromTensor(tt.tensor);
        }
        return null;
    });

    const probabilisticSeriesPlotData = computedAsync(async () => {
        if (tt.isSeries && tt.isProbabilistic && probabilisticSeriesMode.value == "full") {
            return await common.getProbabilisticSeriesPlotDataFromTensor(tt.tensor);
        }
        return null;
    });

    const probabilisticSeriesSingleSamplePlotData = computedAsync(async () => {
        if (tt.isSeries && tt.isProbabilistic && probabilisticSeriesMode.value == "sample") {
            const slicedTensor = tf.tidy(() => {
                return tf.squeeze(
                    tf.slice2d(tf.keep(tt.tensor) as tf.Tensor2D, [sampleId.value, 0], [1, tt.tensor.shape[1]!]),
                    [0]
                );
            });
            const plotData = await common.getDeterministicSeriesPlotDataFromTensor(slicedTensor);
            slicedTensor.dispose();
            return plotData;
        }
        return null;
    });

    const probabilisticSeriesSingleTimestepHistogramData = computedAsync(async () => {
        if (tt.isSeries && tt.isProbabilistic && probabilisticSeriesMode.value == "timestep") {
            const slicedTensor = tf.tidy(() => {
                return tf.squeeze(
                    tf.slice2d(tf.keep(tt.tensor) as tf.Tensor2D, [0, timestepId.value], [tt.tensor.shape[0], 1]),
                    [1]
                );
            });
            const histogramData = await common.getHistogramBinsFromTensor(slicedTensor, bins);
            slicedTensor.dispose();
            return histogramData;
        }
        return null;
    });
</script>

<template>
    <template v-if="deterministicValue != null">
        <DeterministicValueChart :value="deterministicValue" />
    </template>
    <template v-if="histogramData != null">
        <ProbabilisticValueChart :bins="histogramData.bins" :counts="histogramData.counts" :label="nodeTitle" />
    </template>
    <template v-if="deterministicSeriesPlotData != null">
        <DeterministicSeriesChart :values="deterministicSeriesPlotData.values" :label="nodeTitle" />
    </template>
    <template v-if="tt.isSeries && tt.isProbabilistic">
        <ProbabilisticSeriesChart
            v-if="probabilisticSeriesPlotData != null"
            :means="probabilisticSeriesPlotData.means"
            :stddevs="probabilisticSeriesPlotData.stddevs"
            :label="nodeTitle"
        />
        <DeterministicSeriesChart
            v-if="probabilisticSeriesSingleSamplePlotData != null"
            :values="probabilisticSeriesSingleSamplePlotData.values"
            :label="nodeTitle"
        />
        <ProbabilisticValueChart
            v-if="probabilisticSeriesSingleTimestepHistogramData != null"
            :bins="probabilisticSeriesSingleTimestepHistogramData.bins"
            :counts="probabilisticSeriesSingleTimestepHistogramData.counts"
            :label="nodeTitle"
        />
        <div class="options">
            <v-btn-toggle
                v-model="probabilisticSeriesMode"
                divided
                border
                variant="text"
                color="primary"
                class="toggle"
            >
                <v-btn text="All Data" value="full" />
                <v-btn prepend-icon="mdi-scatter-plot" text="Single Sample" value="sample" />
                <v-btn prepend-icon="mdi-clock-outline" text="Single Time Step" value="timestep" />
            </v-btn-toggle>
            <v-slider
                v-if="probabilisticSeriesSingleSamplePlotData != null"
                v-model="sampleId"
                min="0"
                :max="tt.tensor.shape[0]! - 1"
                step="1"
                :label="`Sample ${String(sampleId + 1).padStart(Math.floor(Math.log(tt.tensor.shape[0]!) / Math.log(10)) + 1, '0')}`"
            ></v-slider>
            <v-slider
                v-if="probabilisticSeriesSingleTimestepHistogramData != null"
                v-model="timestepId"
                min="0"
                :max="tt.tensor.shape[1]! - 1"
                step="1"
                :label="`Time Step ${String(timestepId + 1).padStart(Math.floor(Math.log(tt.tensor.shape[1]!) / Math.log(10)) + 1, '0')}`"
            ></v-slider>
        </div>
    </template>
</template>

<style scoped lang="scss">
    .options {
        display: flex;
        flex-direction: column;
        gap: 1em;
        margin-top: 1em;

        .toggle {
            display: flex;

            :deep(button) {
                flex-grow: 1;
            }
        }

        .v-slider {
            margin-right: 1.5em;
        }
    }
</style>
