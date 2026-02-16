<script setup lang="ts">
    import TopMenuItem from "@/components/menu/TopMenuItem.vue";
    import { useComputationStore } from "@/state/computation";

    const computation = useComputationStore();
</script>

<template>
    <v-card class="card">
        <v-list class="list">
            <div class="sectionHeader">
                <h4>Frontend</h4>
            </div>
            <div class="sliderItems">
                <span>Monte Carlo Runs</span>
                <v-slider v-model="computation.state.mcRuns" min="1000" step="1000" max="100000" hide-details />
                <span>{{ computation.state.mcRuns }}</span>

                <span>Histogram Bins</span>
                <v-slider v-model="computation.state.histogramBins" min="10" step="10" max="200" hide-details />
                <span>{{ computation.state.histogramBins }}</span>
            </div>
            <TopMenuItem title="Recalculate Frontend" shortcut="CTRL + 2" disabled @click="console.log('test')" />
            <v-divider />
            <div class="sectionHeader">
                <h4>Backend</h4>
            </div>
            <div class="sliderItems">
                <span>Monte Carlo Runs</span>
                <v-slider min="1000" step="1000" max="100000" hide-details disabled />
                <span>10000</span>

                <span>Histogram Bins</span>
                <v-slider min="10" step="10" max="200" hide-details disabled />
                <span>50</span>
            </div>
            <TopMenuItem title="Run in R Backend" shortcut="CTRL + 3" disabled @click="console.log('test')" />
        </v-list>
    </v-card>
</template>

<style lang="scss" scoped>
    .sectionHeader {
        padding: 1em 1em 0.5em 1em;

        &:first-child {
            padding-top: 0.5em;
        }

        :deep(h4) {
            font-size: 10pt;
            font-weight: 500;
            text-align: center;
            margin: 0;
            padding: 0;
            text-transform: uppercase;
        }
    }

    .sliderItems {
        padding: 0.75em 1em 0.5em 1em;
        display: grid;
        grid-template-columns: auto 10em auto;
        gap: 1em;
        align-items: center;
    }

    :deep(.v-slider) {
        width: 100%;
        padding-right: 1em;
    }
</style>
