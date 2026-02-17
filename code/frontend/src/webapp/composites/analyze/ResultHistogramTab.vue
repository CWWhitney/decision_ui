<script lang="ts" setup>
    import { sleep } from "@/common/async";
    import { catchForComputedResult, COMPUTED_RESULT_ERROR_TYPE } from "@/common/computed";
    import { UI_REFRESH_SLEEP_TIMEOUT } from "@/common/constants";
    import MultiHistogramChart from "@/components/charts/MultiHistogramChart.vue";
    import { useComputationStore } from "@/state/computation";
    import { useGraphStore } from "@/state/graph";
    import { useMetadataStore } from "@/state/metadata";
    import * as common from "@decision-support-ui/common";
    import { computedAsync } from "@vueuse/core";
    import { computed, ref } from "vue";

    const metadata = useMetadataStore();
    const graph = useGraphStore();
    const computation = useComputationStore();

    const histogramDataLoading = ref<boolean>(true);
    const computationErrorLoading = ref<boolean>(true);
    const typedTensorsLoading = ref<boolean>(true);

    const triggerComputedDependencies = () => {
        // calculate useless sum over lower and upper values
        // to trigger computed dependency tracking before sleep
        const _seed = computation.transient.seed;
        const _mcRuns = computation.persisted.mcRuns;
        const _histogramBins = computation.persisted.histogramBins;
        const _estimateSum = graph.computedEstimateNodes.reduce((p, n) => p + n.function.lower + n.function.upper, 0);
    };

    const resultNodeIds = computed(() =>
        graph.state.nodes
            .filter(n => n.type == common.VARIABLE_NODE_TYPE && n.function.type == common.RESULT_FUNCTION_TYPE)
            .map(n => n.id)
    );

    const computationError = computedAsync(
        async () => {
            triggerComputedDependencies();
            await sleep(UI_REFRESH_SLEEP_TIMEOUT);
            const errors = resultNodeIds.value
                .map(nodeId => catchForComputedResult(() => graph.getComputedTypedTensor(nodeId)))
                .filter(r => r.type == COMPUTED_RESULT_ERROR_TYPE);

            return errors.length > 0 ? errors[0]?.message : null;
        },
        null,
        computationErrorLoading
    );

    const noResultNodes = computed(() => resultNodeIds.value.length == 0);

    const typedTensors = computedAsync(
        async () => {
            try {
                triggerComputedDependencies();
                await sleep(UI_REFRESH_SLEEP_TIMEOUT);
                return resultNodeIds.value.map(nodeId => graph.getComputedTypedTensor(nodeId));
            } catch {
                return null;
            }
        },
        null,
        typedTensorsLoading
    );

    const histogramData = computedAsync(
        async () => {
            if (!typedTensors.value || typedTensors.value.length == 0) {
                return null;
            }

            triggerComputedDependencies();
            await sleep(UI_REFRESH_SLEEP_TIMEOUT);
            const histogramData = await common.getMultiHistogramDataFromTensors(
                typedTensors.value.map(t => t.tensor),
                computation.persisted.histogramBins
            );

            return {
                ...histogramData,
                labels: resultNodeIds.value.map(n => graph.getComputedNode(n).visualization.title)
            };
        },
        null,
        histogramDataLoading
    );

    const anyLoading = computed(
        () => histogramDataLoading.value || computationErrorLoading.value || typedTensorsLoading.value
    );
</script>

<template>
    <div class="resultHistogramTabContainer">
        <div v-if="noResultNodes" class="alert-container">
            <v-alert type="info" variant="outlined" :text="`You need to add at least one Result node.`" />
        </div>
        <div v-else-if="computationError" class="alert-container">
            <v-alert type="error" variant="outlined" :text="`Computation Error: ${computationError}`" />
        </div>
        <div v-else-if="anyLoading" class="loading">
            <v-progress-circular indeterminate></v-progress-circular>
        </div>
        <div v-else class="histogramContainer">
            <MultiHistogramChart
                v-if="histogramData"
                :bins="histogramData.bins"
                :counts="histogramData.counts"
                :labels="histogramData.labels"
                :title="metadata.state.name"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
    .loading {
        display: flex;
        width: 100%;
        justify-content: center;
        align-items: center;
    }

    .resultHistogramTabContainer {
        display: flex;
        flex-grow: 1;
    }

    .histogramContainer {
        display: flex;
        flex-grow: 1;
        padding: 0em 1em 1em 1em;
    }

    .alert-container {
        margin-top: 1em;
        width: 100%;
    }
</style>
