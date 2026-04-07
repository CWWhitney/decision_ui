<script setup lang="ts">
    import { TOOLTIP_OPEN_DELAY } from "../../common/constants";
    import {
        R_EXECUTION_FAILED,
        R_EXECUTION_IN_PROGRESS,
        R_EXECUTION_SUCCESS,
        type RExecutionStatus
    } from "../../state/r";

    const props = withDefaults(
        defineProps<{
            disabled?: boolean;
            status: RExecutionStatus;
            label?: string;
            tooltip?: string;
            run: () => void;
        }>(),
        {
            disabled: false,
            label: "run",
            tooltip: "run r code in backend"
        }
    );
</script>

<template>
    <v-tooltip location="top" :open-delay="TOOLTIP_OPEN_DELAY">
        <template #activator="{ props: tooltipProps }">
            <v-btn
                v-bind="tooltipProps"
                :color="
                    status == R_EXECUTION_SUCCESS
                        ? 'success'
                        : status == R_EXECUTION_FAILED
                          ? 'error'
                          : status == R_EXECUTION_IN_PROGRESS
                            ? 'gray'
                            : 'primary'
                "
                :prepend-icon="
                    status == R_EXECUTION_SUCCESS
                        ? 'mdi-check'
                        : status == R_EXECUTION_FAILED
                          ? 'mdi-alert-circle-outline'
                          : status == R_EXECUTION_IN_PROGRESS
                            ? 'mdi-progress-clock'
                            : 'mdi-rocket-launch'
                "
                variant="tonal"
                :text="label"
                :disabled="disabled || status == R_EXECUTION_IN_PROGRESS"
                @click="() => props.run()"
            />
        </template>
        <span>{{ tooltip }}</span>
    </v-tooltip>
</template>
