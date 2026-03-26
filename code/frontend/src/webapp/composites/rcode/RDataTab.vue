<script setup lang="ts">
    import RRunButton from "@/components/r/RRunButton.vue";
    import type { RExecutionStatus } from "@/state/r";
    import { computed } from "vue";

    const props = withDefaults(
        defineProps<{
            columns: string[] | null;
            data: { [header: string]: any }[] | null;
            run: () => void;
            status: RExecutionStatus;
            canRun: boolean;
        }>(),
        {}
    );

    const dataModel = computed({
        get: () => {
            return props.data;
        },
        set: () => {
            // ignore setter
        }
    });
</script>

<template>
    <div v-if="data && data.length > 0" class="tableContainer">
        <vue-excel-editor v-model="dataModel" no-header-edit no-sorting no-footer readonly>
            <template v-for="column in props.columns" :key="column">
                <vue-excel-column :field="column" :label="column" auto-fill-width />
            </template>
        </vue-excel-editor>
    </div>
    <div v-else class="otherContainer">
        <div v-if="canRun" class="runContainer">
            <RRunButton :run="run" :status="status" label="Run Code" />
        </div>
        <v-alert v-else type="info" variant="outlined">
            There is no data to show. Add at least one result node.</v-alert
        >
    </div>
</template>

<style scoped lang="scss">
    .tableContainer {
        margin-top: 1em;
        display: flex;
        width: 100%;
        overflow: hidden;
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
