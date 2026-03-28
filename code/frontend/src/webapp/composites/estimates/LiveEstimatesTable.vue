<script setup lang="ts">
    import { computed, useTemplateRef } from "vue";
    import FileSaver from "file-saver";
    import * as common from "@decision-support-ui/common";

    import { useGraphStore } from "../../state/graph";

    const graph = useGraphStore();

    const uploadEstimatesInput = useTemplateRef<HTMLInputElement>("uploadEstimatesInput");

    interface Field {
        name: string;
        type: string;
    }

    const estimatesData = computed(() => {
        return common.generateEstimatesTableFromGraph(graph.state.nodes);
    });

    const onDownload = () => {
        const rows = common.generateEstimatesTableFromGraph(graph.state.nodes);
        FileSaver.saveAs(new Blob([common.convertEstimatesToCSV(rows)], { type: "text/csv" }), "estimates.csv");
    };

    const onUploadEstimates = async () => {
        if (uploadEstimatesInput.value && uploadEstimatesInput.value.files) {
            const csv = await uploadEstimatesInput.value.files[0]!.text();
            const rows = await common.parseEstimatesFromCSV(csv);
            for (const row of rows) {
                try {
                    const node = graph.getComputedNode(row.node);
                    if (node) {
                        for (const field of common.UPDATEDABLE_ESTIMATE_FIELDS) {
                            common.updateNodeFromEstimateTableEdit(
                                node as common.EstimateNode,
                                field,
                                `${row[field]}`,
                                row
                            );
                        }
                    }
                } catch (e) {
                    console.error(`error parsing csv row for node ${row.node}`, e);
                }
            }
        }
    };

    const onFieldChange = (newVal: string, oldVal: string, row: common.EstimatesTableRow, field: Field) => {
        const node = graph.getComputedNode(row.node);
        if (node) {
            const column = field.name as common.EstimatesTableColumn;
            common.updateNodeFromEstimateTableEdit(node as common.EstimateNode, column, newVal, row);
        }
    };
</script>

<template>
    <v-card color="white" elevation="1" class="estimatesTableCard" rounded>
        <v-card-item>
            <template #title> Estimates Table </template>
            <template #subtitle>
                All estimates synchronized with the model editor. Any changes will immediately be applied:
            </template>
            <template #append>
                <v-btn-group density="compact">
                    <v-tooltip location="bottom" text="download table as CSV" open-delay="500">
                        <template #activator="{ props }">
                            <v-btn
                                v-show="estimatesData.length > 0"
                                density="compact"
                                v-bind="props"
                                @click.prevent="onDownload"
                            >
                                <template #prepend>
                                    <v-icon> mdi-tray-arrow-down </v-icon>
                                </template>
                                download
                            </v-btn>
                        </template>
                    </v-tooltip>
                    <v-tooltip location="bottom" text="upload CSV file" open-delay="500">
                        <template #activator="{ props }">
                            <v-btn
                                v-show="estimatesData.length > 0"
                                density="compact"
                                v-bind="props"
                                @click="uploadEstimatesInput?.click()"
                            >
                                <template #prepend>
                                    <v-icon> mdi-tray-arrow-up </v-icon>
                                </template>
                                <input
                                    ref="uploadEstimatesInput"
                                    type="file"
                                    style="display: none"
                                    @change="onUploadEstimates"
                                />
                                upload
                            </v-btn>
                        </template>
                    </v-tooltip>
                    <v-tooltip location="bottom" text="go to help section" open-delay="500">
                        <template #activator="{ props }">
                            <v-btn v-bind="props" to="/help/user-interface/estimate-editor/">
                                <template #prepend>
                                    <v-icon size="large"> mdi-help-circle-outline </v-icon>
                                </template>
                                Help
                            </v-btn>
                        </template>
                    </v-tooltip>
                </v-btn-group>
            </template>
        </v-card-item>
        <v-card-text>
            <vue-excel-editor
                v-if="estimatesData.length > 0"
                v-model="estimatesData"
                no-paging
                no-header-edit
                no-sorting
                no-mass-update
                no-footer
                class="estimatesTable"
            >
                <vue-excel-column
                    :change="onFieldChange"
                    mandatory
                    :field="common.ESTIMATES_CSV_LABEL_HEADER"
                    label="Label"
                    width="150px"
                    auto-fill-width
                    sticky
                />
                <vue-excel-column
                    :change="onFieldChange"
                    :field="common.ESTIMATES_CSV_VARIABLE_HEADER"
                    label="Variable Name"
                    width="150px"
                    auto-fill-width
                    bg-color="#aaa"
                />
                <vue-excel-column
                    :change="onFieldChange"
                    :field="common.ESTIMATES_CSV_DISTRIBUTION_HEADER"
                    width="120px"
                    label="Distribution"
                    type="select"
                    :options="['const', 'norm', 'posnorm', 'tnorm_0_1']"
                />
                <vue-excel-column
                    :change="onFieldChange"
                    :field="common.ESTIMATES_CSV_LOWER_HEADER"
                    label="Lower"
                    width="120px"
                    type="number"
                />
                <vue-excel-column
                    :change="onFieldChange"
                    :field="common.ESTIMATES_CSV_UPPER_HEADER"
                    label="Upper"
                    width="120px"
                    type="number"
                />
                <vue-excel-column
                    :change="onFieldChange"
                    :field="common.ESTIMATES_CSV_COMMENT_HEADER"
                    label="Comment"
                    type="string"
                    width="300px"
                    auto-fill-width
                />
                <vue-excel-column :field="common.ESTIMATES_CSV_NODE_HEADER" invisible />
            </vue-excel-editor>
            <v-alert v-else type="info" variant="outlined">
                There are no estimates yet. Please add at least one estimate node to your model.
            </v-alert>
        </v-card-text>
    </v-card>
</template>

<style scoped lang="scss">
    .estimatesTableCard {
        padding: 1em;
        width: 100%;
    }
</style>
