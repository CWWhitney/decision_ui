<script setup lang="ts">
    import * as common from "@decision-support-ui/common";
    import * as tf from "@tensorflow/tfjs";

    import { computedAsync } from "@vueuse/core";
    import { computed, ref } from "vue";

    import DeterministicValueChart from "../../charts/DeterministicValueChart.vue";
    import ProbabilisticValueChart from "../../charts/ProbabilisticValueChart.vue";
    import DeterministicSeriesChart from "../../charts/DeterministicSeriesChart.vue";
    import ProbabilisticSeriesBoxPlotChart from "../../charts/ProbabilisticSeriesBoxPlotChart.vue";

    import { sleep } from "../../../common/async";
    import { UI_REFRESH_SLEEP_TIMEOUT } from "../../../common/constants";

    const { nodeTitle, tt, bins } = defineProps<{
        nodeTitle: string;
        tt: common.TypedTensor;
        bins: number;
    }>();

    const probabilisticSeriesMode = ref<"full" | "sample" | "timestep">("full");
    const deterministicValueLoading = ref<boolean>(false);
    const histogramDataLoading = ref<boolean>(false);
    const deterministicSeriesPlotDataLoading = ref<boolean>(false);
    const probabilisticSeriesBoxPlotDataLoading = ref<boolean>(false);
    const probabilisticSeriesSingleSamplePlotDataLoading = ref<boolean>(false);
    const probabilisticSeriesSingleTimestepHistogramDataLoading = ref<boolean>(false);

    const sampleId = ref<number>(0);
    const timestepId = ref<number>(0);

    const deterministicValue = computedAsync(
        async () => {
            if (!tt.isProbabilistic && !tt.isSeries) {
                await sleep(UI_REFRESH_SLEEP_TIMEOUT);
                return (await tt.tensor.array()) as number;
            }
            return null;
        },
        null,
        deterministicValueLoading
    );

    const histogramData = computedAsync(
        async () => {
            if (tt.isProbabilistic && !tt.isSeries) {
                await sleep(UI_REFRESH_SLEEP_TIMEOUT);
                return await common.getHistogramDataFromTensor(tt.tensor, bins);
            }
            return null;
        },
        null,
        histogramDataLoading
    );

    const deterministicSeriesPlotData = computedAsync(
        async () => {
            if (tt.isSeries && !tt.isProbabilistic) {
                await sleep(UI_REFRESH_SLEEP_TIMEOUT);
                return await common.getDeterministicSeriesPlotDataFromTensor(tt.tensor);
            }
            return null;
        },
        null,
        deterministicSeriesPlotDataLoading
    );

    const probabilisticSeriesBoxPlotData = computedAsync(
        async () => {
            if (tt.isSeries && tt.isProbabilistic && probabilisticSeriesMode.value == "full") {
                await sleep(UI_REFRESH_SLEEP_TIMEOUT);
                return await common.getProbabilisticSeriesBoxPlotDataFromTensor(tt.tensor);
            }
            return null;
        },
        null,
        probabilisticSeriesBoxPlotDataLoading
    );

    const probabilisticSeriesSingleSamplePlotData = computedAsync(
        async () => {
            if (tt.isSeries && tt.isProbabilistic && probabilisticSeriesMode.value == "sample") {
                const slicedTensor = tf.tidy(() => {
                    return tf.squeeze(
                        tf.slice2d(tf.keep(tt.tensor) as tf.Tensor2D, [sampleId.value, 0], [1, tt.tensor.shape[1]!]),
                        [0]
                    );
                });
                await sleep(UI_REFRESH_SLEEP_TIMEOUT);
                const plotData = await common.getDeterministicSeriesPlotDataFromTensor(slicedTensor);
                slicedTensor.dispose();
                return plotData;
            }
            return null;
        },
        null,
        probabilisticSeriesSingleSamplePlotDataLoading
    );

    const probabilisticSeriesSingleTimestepHistogramData = computedAsync(
        async () => {
            if (tt.isSeries && tt.isProbabilistic && probabilisticSeriesMode.value == "timestep") {
                const slicedTensor = tf.tidy(() => {
                    return tf.squeeze(
                        tf.slice2d(tf.keep(tt.tensor) as tf.Tensor2D, [0, timestepId.value], [tt.tensor.shape[0], 1]),
                        [1]
                    );
                });
                await sleep(UI_REFRESH_SLEEP_TIMEOUT);
                const histogramData = await common.getHistogramDataFromTensor(slicedTensor, bins);
                slicedTensor.dispose();
                return histogramData;
            }
            return null;
        },
        null,
        probabilisticSeriesSingleTimestepHistogramDataLoading
    );

    const isLoading = computed(
        () =>
            deterministicValueLoading.value ||
            histogramDataLoading.value ||
            deterministicSeriesPlotDataLoading.value ||
            probabilisticSeriesBoxPlotDataLoading.value ||
            probabilisticSeriesSingleSamplePlotDataLoading.value ||
            probabilisticSeriesSingleTimestepHistogramDataLoading.value
    );
</script>

<template>
    <template v-if="isLoading">
        <div class="loading">
            <v-progress-circular indeterminate></v-progress-circular>
        </div>
    </template>
    <template v-else>
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
            <ProbabilisticSeriesBoxPlotChart
                v-if="probabilisticSeriesBoxPlotData != null"
                :box-plot-data="probabilisticSeriesBoxPlotData"
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
        </template>
    </template>
    <template v-if="tt.isSeries && tt.isProbabilistic">
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
                hide-details
                :label="`Sample ${String(sampleId + 1).padStart(Math.floor(Math.log(tt.tensor.shape[0]!) / Math.log(10)) + 1, '0')}`"
            ></v-slider>
            <v-slider
                v-if="probabilisticSeriesSingleTimestepHistogramData != null"
                v-model="timestepId"
                min="0"
                :max="tt.tensor.shape[1]! - 1"
                step="1"
                hide-details
                :label="`Time Step ${String(timestepId + 1).padStart(Math.floor(Math.log(tt.tensor.shape[1]!) / Math.log(10)) + 1, '0')}`"
            ></v-slider>
        </div>
    </template>
</template>

<style scoped lang="scss">
    .loading {
        flex-grow: 1;
        display: flex;
        width: 100%;
        height: 100%;
        justify-content: center;
        align-items: center;
        min-height: 22em;
    }

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

        :deep(.v-slider) {
            margin-right: 1.5em;
            margin-bottom: 0.5em;
        }
    }
</style>
