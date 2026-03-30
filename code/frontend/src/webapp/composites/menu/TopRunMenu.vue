<script setup lang="ts">
    import { useRouter } from "vue-router";
    import LazySlider from "../../components/form/LazySlider.vue";
    import TopMenuItem from "../../components/menu/TopMenuItem.vue";
    import { useComputationStore } from "../../state/computation";
    import { useRStore } from "../../state/r";

    const computation = useComputationStore();
    const rStore = useRStore();
    const router = useRouter();

    const calculateResultHistogram = () => {
        rStore.calculateResultHistogram();
        router.push({ name: "rTabs", params: { variantTab: "histogram", displayTab: "diagram" } });
    };

    const calculateEvpi = () => {
        rStore.calculateEvpi();
        router.push({ name: "rTabs", params: { variantTab: "evpi", displayTab: "diagram" } });
    };
</script>

<template>
    <v-card class="card">
        <v-list class="list">
            <div class="sectionHeader">
                <h4>Frontend</h4>
            </div>
            <div class="sliderItems">
                <span>Monte Carlo Runs</span>
                <LazySlider
                    v-model="computation.persisted.frontend.mcRuns"
                    min="1000"
                    step="1000"
                    max="100000"
                    hide-details
                />
                <span>{{ computation.persisted.frontend.mcRuns }}</span>

                <span>Histogram Bins</span>
                <LazySlider
                    v-model="computation.persisted.frontend.histogramBins"
                    min="10"
                    step="10"
                    max="200"
                    hide-details
                />
                <span>{{ computation.persisted.frontend.histogramBins }}</span>
            </div>
            <v-list-item class="gpuAccelerationToggle" @click="computation.toggleGpuAcceleration">
                <template #title>Use GPU acceleration (if available)</template>
                <template #append>
                    <v-switch
                        v-model="computation.persisted.frontend.gpuAcceleration"
                        color="primary"
                        hide-details
                        inset
                    />
                </template>
            </v-list-item>
            <TopMenuItem title="Recalculate Frontend" shortcut="CTRL + 2" @click="computation.triggerRecalculation" />
            <v-divider />
            <div class="sectionHeader">
                <h4>R Backend</h4>
            </div>
            <TopMenuItem
                title="Calculate Result Histogram"
                shortcut="CTRL + 3"
                :disabled="!rStore.canCalculateResultHistogram"
                @click="calculateResultHistogram"
            />
            <TopMenuItem
                title="Calculate EVPI"
                shortcut="CTRL + 4"
                :disabled="!rStore.calculateEvpi"
                @click="calculateEvpi"
            />
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

    .gpuAccelerationToggle {
        display: flex;
        gap: 1em;
        padding: 0em 1em;
        align-items: center;
        justify-content: space-between;
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
