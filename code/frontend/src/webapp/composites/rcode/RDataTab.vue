<script setup lang="ts">
    import FileSaver from "file-saver";
    import { computed } from "vue";

    import { TOOLTIP_OPEN_DELAY } from "../../common/constants";
    import type { RExecutionStatus } from "../../state/r";

    import RRunButton from "../../components/r/RRunButton.vue";
    import RHint from "./RHint.vue";

    const props = withDefaults(
        defineProps<{
            description: string;
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

    const tableAsCSV = computed(() => {
        const columns = props.columns;
        const data = props.data;
        if (columns && data) {
            const replaceNull = (key: string, value: any) => (value === null ? "" : value);
            return [
                columns.join(","),
                ...data.map(row => columns.map(field => JSON.stringify((row as any)[field], replaceNull)).join(","))
            ].join("\r\n");
        }
        return null;
    });

    const download = () => {
        FileSaver.saveAs(new Blob([tableAsCSV.value ?? ""], { type: "text/csv" }), "data.csv");
    };

    const copy = () => {
        navigator.clipboard.writeText(tableAsCSV.value || "");
    };
</script>

<template>
    <div class="rDataContainer">
        <v-toolbar class="toolbar">
            <template #prepend>
                <p>{{ props.description }}</p>
            </template>
            <template #append>
                <v-btn-group>
                    <v-tooltip location="top" :open-delay="TOOLTIP_OPEN_DELAY">
                        <template #activator="{ props: tooltipProps }">
                            <v-btn
                                v-bind="tooltipProps"
                                prepend-icon="mdi-content-copy"
                                text="Copy"
                                variant="text"
                                :disabled="!data"
                                @click.prevent="copy"
                            />
                        </template>
                        <span>Copy to Clipboard</span>
                    </v-tooltip>
                    <v-tooltip location="bottom" text="download table as CSV" :open-delay="TOOLTIP_OPEN_DELAY">
                        <template #activator="{ props: tooltipProps }">
                            <v-btn
                                density="compact"
                                v-bind="tooltipProps"
                                variant="text"
                                :disabled="!data"
                                @click.prevent="download"
                            >
                                <template #prepend>
                                    <v-icon> mdi-tray-arrow-down </v-icon>
                                </template>
                                download
                            </v-btn>
                        </template>
                    </v-tooltip>
                    <RRunButton :run="run" :disabled="!canRun" :status="status" label="Run" />
                </v-btn-group>
            </template>
        </v-toolbar>
        <div v-if="data" class="tableContainer">
            <vue-excel-editor v-model="dataModel" no-header-edit no-sorting no-footer readonly>
                <template v-for="column in props.columns" :key="column">
                    <vue-excel-column :field="column" :label="column" auto-fill-width />
                </template>
            </vue-excel-editor>
        </div>
        <template v-else>
            <RHint />
            <div class="runContainer">
                <RRunButton :run="run" :status="status" :disabled="!canRun" label="Calculate Data" />
            </div>
        </template>
    </div>
</template>

<style scoped lang="scss">
    .rDataContainer {
        display: flex;
        flex-direction: column;
        justify-items: stretch;
        width: 100%;
        height: 100%;
    }

    .tableContainer {
        display: flex;
        flex-direction: column;
        justify-items: stretch;
        width: 100%;
        height: 100%;
    }

    .toolbar {
        background-color: transparent;
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
