<script lang="ts" setup>
    import MultiHistogramChart from "@/components/charts/MultiHistogramChart.vue";
    import RRunButton from "@/components/r/RRunButton.vue";
    import { type RExecutionStatus } from "@/state/r";
    import { transposeArray, type CalculateResultHistogramData } from "@decision-support-ui/common";
    import RHint from "./RHint.vue";

    withDefaults(
        defineProps<{
            data: CalculateResultHistogramData | null;
            run: () => void;
            status: RExecutionStatus;
            canRun: boolean;
        }>(),
        {}
    );
</script>

<template>
    <div v-if="data" class="mainContainer">
        <div class="resultHistogramContainer">
            <MultiHistogramChart
                :bins="data.bins"
                :counts="transposeArray(data.counts)"
                :labels="data.variables"
                title="test"
            />
        </div>
    </div>
    <div v-else class="otherContainer">
        <div v-if="canRun" class="runContainer">
            <RRunButton :run="run" :status="status" label="Run Code" />
        </div>
        <RHint />
    </div>
</template>

<style lang="scss" scoped>
    .mainContainer {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .toolbar {
        background-color: transparent;
    }

    .resultHistogramContainer {
        display: flex;
        flex-grow: 1;
        padding: 0em 1em 1em 1em;
    }

    .otherContainer {
        width: 100%;

        :deep(.v-alert) {
            margin-top: 1em;
        }
    }

    .runContainer {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
