<script setup lang="ts">
    import { useComputationStore } from "@/state/computation";

    const computation = useComputationStore();
</script>

<template>
    <v-card class="card">
        <span>Monte Carlo Runs</span>
        <v-slider v-model="computation.state.mcRuns" min="1000" step="1000" max="100000" hide-details />
        <span>{{ computation.state.mcRuns }}</span>

        <span>Histogram Bins</span>
        <v-slider v-model="computation.state.histogramBins" min="10" step="10" max="200" hide-details />
        <span>{{ computation.state.histogramBins }}</span>
    </v-card>
</template>

<style lang="scss" scoped>
    .card {
        padding: 1.25em 1em;
        display: grid;
        grid-template-columns: auto 10em auto;
        gap: 1.5em 2em;
        align-items: center;
    }

    .slider-menu-entry {
        :deep(.v-list-item__content) {
            display: flex;
            gap: 1em;
            align-items: bottom;
        }

        :deep(label) {
            opacity: 1;
        }
    }

    :deep(.v-slider) {
        min-width: 10em;
    }
</style>
