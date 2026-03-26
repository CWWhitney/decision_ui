<script lang="ts" setup>
    import { computed, ref } from "vue";
    import RHistogramTab from "./RResultHistogramTab.vue";
    import RCodeTab from "./RCodeTab.vue";
    import { useRStore } from "@/state/r";
    import RDataTab from "./RDataTab.vue";

    const rStore = useRStore();

    const activeVariantTab = ref<string>("histogram");
    const activeDisplayTab = ref<string>("code");

    const combinedActiveTab = computed(() => `${activeVariantTab.value}+${activeDisplayTab.value}`);

    const runResultHistogram = () => {
        console.log("runResultHistogram");
        rStore.calculateResultHistogram();
    };

    const resultHistogramDataTable = computed(() => {
        const data = rStore.state.resultHistogram.data;
        if (!data) {
            return null;
        }
        console.log("result histogram data: ", data);
        return data.bins.map((bin, idx) => {
            return {
                bins: bin,
                ...Object.fromEntries(data.variables.map((v, i) => [v, data.counts[idx]![i]]))
            };
        }) as { [header: string]: any }[];
    });
</script>

<template>
    <v-card color="white" elevation="1" rounded class="rCard">
        <v-card-text>
            <div class="variantTabs">
                <v-tabs v-model="activeVariantTab" color="primary" align-tabs="center">
                    <v-tab value="histogram">Result Histogram</v-tab>
                    <v-tab value="evpi">EVPI</v-tab>
                    <v-tab value="variableImportance" disabled>Variable Importance</v-tab>
                </v-tabs>

                <v-tooltip location="bottom" text="go to help section" open-delay="500">
                    <template #activator="{ props }">
                        <v-btn v-bind="props" to="/help/user-interface/r-code/" variant="flat" class="helpButton">
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
                </v-tabs>

                <div class="tabContents">
                    <v-tabs-window v-model="combinedActiveTab">
                        <v-tabs-window-item value="histogram+code">
                            <RCodeTab
                                :status="rStore.state.resultHistogram.status"
                                :code="rStore.computedRHistogramCode"
                                :run="runResultHistogram"
                                description="The R script that corresponds to the model and plots result variables in a histogram:"
                            />
                        </v-tabs-window-item>
                        <v-tabs-window-item value="histogram+data">
                            <RDataTab
                                :data="resultHistogramDataTable"
                                :run="runResultHistogram"
                                :status="rStore.state.resultHistogram.status"
                                :columns="['bins', ...(rStore.state.resultHistogram.data?.variables ?? [])]"
                                :can-run="!!rStore.computedRHistogramCode"
                            />
                        </v-tabs-window-item>
                        <v-tabs-window-item value="histogram+diagram">
                            <RHistogramTab
                                :data="rStore.state.resultHistogram.data"
                                :run="runResultHistogram"
                                :status="rStore.state.resultHistogram.status"
                                :can-run="!!rStore.computedRHistogramCode"
                            />
                        </v-tabs-window-item>
                        <v-tabs-window-item value="evpi+code">
                            <RCodeTab
                                :status="rStore.state.resultHistogram.status"
                                :code="rStore.computedREvpiCode"
                                :run="runResultHistogram"
                                description="The R script that implements the EVPI (Expected Value of Perfect Information) analysis:"
                            />
                        </v-tabs-window-item>
                    </v-tabs-window>
                </div>
            </div>
        </v-card-text>
    </v-card>
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
        margin-left: 1em;
        margin-right: 1em;
    }

    .tabContents {
        display: flex;
        overflow: scroll;
        width: 100%;
        height: 100%;

        :deep(.v-window),
        :deep(.v-window__container),
        :deep(.v-window-item) {
            display: flex;
            height: 100%;
            width: 100%;
        }
    }
</style>
