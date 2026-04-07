<script lang="ts" setup>
    import { computed } from "vue";
    import * as common from "@decision-support-ui/common";

    import { useRStore } from "../../state/r";
    import { useGraphStore } from "../../state/graph";
    import { useComputationStore } from "../../state/computation";

    import RDataTab from "./RDataTab.vue";
    import RHistogramTab from "./RResultHistogramTab.vue";
    import RCodeTab from "./RCodeTab.vue";
    import RErrorDialog from "./RErrorDialog.vue";
    import REvpiDiagramTab from "./REvpiDiagramTab.vue";
    import RSettingsTab from "./RSettingsTab.vue";
    import { useRoute, useRouter } from "vue-router";

    const rStore = useRStore();
    const graph = useGraphStore();
    const computation = useComputationStore();
    const route = useRoute();
    const router = useRouter();

    const activeVariantTab = computed({
        get: () => route.params.variantTab || "histogram",
        set: newVariantTab => {
            router.push({ name: "rTabs", params: { displayTab: activeDisplayTab.value, variantTab: newVariantTab } });
        }
    });
    const activeDisplayTab = computed({
        get: () => route.params.displayTab || "code",
        set: newDisplayTab => {
            router.push({ name: "rTabs", params: { variantTab: activeVariantTab.value, displayTab: newDisplayTab } });
        }
    });

    const combinedActiveTab = computed(() => `${activeVariantTab.value}+${activeDisplayTab.value}`);

    const estimatesCsv = computed(() =>
        common.convertEstimatesToCSV(common.generateEstimatesTableFromGraph(graph.state.nodes))
    );

    const resultHistogramDataTable = computed(() => {
        const data = rStore.state.resultHistogram.data;
        if (!data) {
            return null;
        }
        return data.bins.map((bin, idx) => {
            return {
                bins: bin,
                ...Object.fromEntries(data.variables.map((v, i) => [v, data.counts[idx]![i]]))
            };
        }) as { [header: string]: any }[];
    });

    const evpiDataTable = computed(() => {
        const data = rStore.state.evpi.data;
        if (!data) {
            return null;
        }
        const estimateVariables = Object.keys(data);
        if (!estimateVariables) {
            return null;
        }
        const resultVariables = Object.keys(data[estimateVariables[0]!] ?? {});
        if (!resultVariables) {
            return null;
        }

        return estimateVariables.map(estimateVariable => {
            return {
                variables: estimateVariable,
                ...Object.fromEntries(
                    resultVariables.map(resultVariable => [resultVariable, data[estimateVariable]![resultVariable]])
                )
            };
        }) as { [header: string]: any }[];
    });

    const evpiTableColumns = computed(() => {
        const data = rStore.state.evpi.data;
        if (!data) {
            return null;
        }
        const estimateVariables = Object.keys(data);
        if (!estimateVariables) {
            return null;
        }
        const resultVariables = Object.keys(data[estimateVariables[0]!] ?? {});
        if (!resultVariables) {
            return null;
        }

        return ["variables", ...resultVariables];
    });
</script>

<template>
    <v-card color="white" elevation="1" rounded class="rCard">
        <v-card-text>
            <div class="variantTabs">
                <h3>R Backend</h3>

                <v-tabs v-model="activeVariantTab" color="primary" align-tabs="center">
                    <v-tab value="histogram">Result Histogram</v-tab>
                    <v-tab value="evpi">EVPI</v-tab>
                    <v-tab value="variableImportance" disabled>Variable Importance</v-tab>
                </v-tabs>

                <v-tooltip location="bottom" text="go to help section" open-delay="500">
                    <template #activator="{ props }">
                        <v-btn v-bind="props" to="/help/user-interface/r-backend/" variant="flat" class="helpButton">
                            <template #prepend>
                                <v-icon size="large"> mdi-help-circle-outline </v-icon>
                            </template>
                            Help
                        </v-btn>
                    </template>
                </v-tooltip>
            </div>

            <div class="displayTabsContainer">
                <v-tabs v-model="activeDisplayTab" color="primary" direction="vertical" class="displayTabs">
                    <v-tab value="code">Code</v-tab>
                    <v-tab value="data">Data</v-tab>
                    <v-tab value="diagram">Diagram</v-tab>
                    <v-tab value="settings">Settings</v-tab>
                </v-tabs>

                <div class="tabContents">
                    <v-tabs-window v-model="combinedActiveTab">
                        <v-tabs-window-item value="histogram+code">
                            <RCodeTab
                                :status="rStore.state.resultHistogram.status"
                                :code="rStore.computedRResultHistogramCode"
                                :estimates-csv="estimatesCsv"
                                :run="() => rStore.calculateResultHistogram()"
                                :can-run="rStore.canCalculateResultHistogram"
                                description="The R script that corresponds to the model and plots result variables in a histogram:"
                            />
                        </v-tabs-window-item>
                        <v-tabs-window-item value="histogram+data">
                            <RDataTab
                                description="Calculated bins and counts for the result histogram:"
                                :data="resultHistogramDataTable"
                                :run="() => rStore.calculateResultHistogram()"
                                :status="rStore.state.resultHistogram.status"
                                :columns="['bins', ...(rStore.state.resultHistogram.data?.variables ?? [])]"
                                :can-run="rStore.canCalculateResultHistogram"
                            />
                        </v-tabs-window-item>
                        <v-tabs-window-item value="histogram+diagram">
                            <RHistogramTab
                                :data="rStore.state.resultHistogram.data"
                                :run="() => rStore.calculateResultHistogram()"
                                :status="rStore.state.resultHistogram.status"
                                :can-run="rStore.canCalculateResultHistogram"
                            />
                        </v-tabs-window-item>
                        <v-tabs-window-item value="histogram+settings">
                            <RSettingsTab
                                v-model="computation.persisted.backend.resultHistogram"
                                :mc-runs="{ min: 1000, max: 100000, step: 1000 }"
                                :histogram-bins="{ min: 10, max: 200, step: 10 }"
                                :max-runtime="{ min: 1, max: 30, step: 1 }"
                            />
                        </v-tabs-window-item>
                        <v-tabs-window-item value="evpi+code">
                            <RCodeTab
                                :status="rStore.state.evpi.status"
                                :code="rStore.computedREvpiCode"
                                :estimates-csv="estimatesCsv"
                                :run="() => rStore.calculateEvpi()"
                                :can-run="rStore.canCalculateEvpi"
                                description="The R script that calculates the EVPI (Expected Value of Perfect Information):"
                            />
                        </v-tabs-window-item>
                        <v-tabs-window-item value="evpi+data">
                            <RDataTab
                                description="Calculated EVPI for each result variable:"
                                :data="evpiDataTable"
                                :run="() => rStore.calculateEvpi()"
                                :status="rStore.state.evpi.status"
                                :columns="evpiTableColumns"
                                :can-run="rStore.canCalculateEvpi"
                            />
                        </v-tabs-window-item>
                        <v-tabs-window-item value="evpi+diagram">
                            <REvpiDiagramTab
                                :status="rStore.state.evpi.status"
                                :run="() => rStore.calculateEvpi()"
                                :can-run="rStore.canCalculateEvpi"
                                :data="rStore.state.evpi.data"
                            />
                        </v-tabs-window-item>
                        <v-tabs-window-item value="evpi+settings">
                            <RSettingsTab
                                v-model="computation.persisted.backend.evpi"
                                :mc-runs="{ min: 1000, max: 10000, step: 500 }"
                                :max-runtime="{ min: 1, max: 30, step: 1 }"
                            />
                        </v-tabs-window-item>
                    </v-tabs-window>
                </div>
            </div>
        </v-card-text>
    </v-card>
    <RErrorDialog />
</template>

<style lang="scss" scoped>
    .rCard {
        display: flex;
        flex-direction: column;
        width: 100%;

        :deep(.v-card-text) {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            width: 100%;
            height: 100%;
        }

        .helpButton {
            margin-top: 0.5em;
        }
    }

    .variantTabs {
        margin-bottom: 0.5em;
        display: flex;
        align-items: center;

        h3 {
            font-size: 20px;
            margin-left: 0.75em;
            font-weight: 500;
        }

        :deep(.v-tabs) {
            flex-grow: 1;
        }
    }

    .displayTabsContainer {
        display: flex;
        width: 100%;
        overflow: hidden;
        flex-grow: 1;
    }

    .displayTabs {
        width: 10em;
        margin-top: 1em;
        margin-left: 1em;
        margin-right: 1em;
    }

    .tabContents {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        position: relative;
        min-width: 0;
        min-height: 0;

        :deep(.v-window),
        :deep(.v-window__container),
        :deep(.v-window-item) {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
        }
    }
</style>
