<script lang="ts" setup>
    import { ref } from "vue";
    import ResultHistogramTab from "./ResultHistogramTab.vue";

    const activeTab = ref<string>("histogram");
</script>

<template>
    <v-tabs v-model="activeTab" color="primary" align-tabs="center" class="resultDiagramTabs">
        <v-tab value="histogram">Result Histogram</v-tab>
        <v-tab value="evpi" disabled>EVPI</v-tab>
        <v-tab value="variableImportance" disabled>Variable Importance</v-tab>
    </v-tabs>

    <v-tabs-window v-model="activeTab">
        <v-tabs-window-item value="histogram">
            <ResultHistogramTab />
        </v-tabs-window-item>
    </v-tabs-window>
</template>

<style lang="scss" scoped>
    .resultDiagramTabs {
        margin-bottom: 0.5em;
    }
</style>
