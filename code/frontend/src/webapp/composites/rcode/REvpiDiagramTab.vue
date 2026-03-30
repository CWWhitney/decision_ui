<script lang="ts" setup>
    import { type CalculateEvpiData } from "@decision-support-ui/common";

    import RRunButton from "../../components/r/RRunButton.vue";
    import { type RExecutionStatus } from "../../state/r";
    import EvpiBoxChart from "../../components/charts/EvpiBoxChart.vue";

    import RHint from "./RHint.vue";

    withDefaults(
        defineProps<{
            data: CalculateEvpiData | null;
            run: () => void;
            status: RExecutionStatus;
            canRun: boolean;
        }>(),
        {}
    );
</script>

<template>
    <div v-if="data" class="mainContainer">
        <div class="evpiDiagramContainer">
            <EvpiBoxChart :data="data" title="evpi" />
        </div>
    </div>
    <div v-else class="otherContainer">
        <div class="runContainer">
            <RRunButton :run="run" :status="status" :disabled="!canRun" label="Run Code" />
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

    .evpiDiagramContainer {
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
