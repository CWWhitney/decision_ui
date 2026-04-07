<script lang="ts" setup>
    const model = defineModel<{
        mcRuns: number;
        histogramBins?: number;
        maxRuntime: number;
    }>({ required: true });

    const props = withDefaults(
        defineProps<{
            mcRuns?: { min: number; max: number; step: number };
            histogramBins?: { min: number; max: number; step: number };
            maxRuntime?: { min: number; max: number; step: number };
        }>(),
        {
            mcRuns: () => ({ min: 1000, max: 100000, step: 1000 }),
            histogramBins: () => ({ min: 10, max: 200, step: 10 }),
            maxRuntime: () => ({ min: 1, max: 30, step: 1 })
        }
    );
</script>

<template>
    <div class="settingsContainer">
        <p>Specify various parameters that influence the R backend calculation:</p>
        <v-table class="settingsTable" density="compact">
            <tbody>
                <tr>
                    <th>Monte Carlo Runs</th>
                    <td class="sliderCell">
                        <v-slider
                            v-model="model.mcRuns"
                            class="slider"
                            :max="props.mcRuns.max"
                            :min="props.mcRuns.min"
                            :step="props.mcRuns.step"
                            width="100%"
                            hide-details
                        >
                            <template #append>
                                <v-text-field
                                    v-model="model.mcRuns"
                                    density="compact"
                                    width="140px"
                                    type="number"
                                    variant="outlined"
                                    hide-details
                                ></v-text-field>
                            </template>
                        </v-slider>
                    </td>
                </tr>
                <tr v-if="model.histogramBins">
                    <th>Histogram Bins</th>
                    <td>
                        <v-slider
                            v-model="model.histogramBins"
                            class="slider"
                            :max="props.histogramBins.max"
                            :min="props.histogramBins.min"
                            :step="props.histogramBins.step"
                            width="100%"
                            hide-details
                        >
                            <template #append>
                                <v-text-field
                                    v-model="model.histogramBins"
                                    density="compact"
                                    width="140px"
                                    type="number"
                                    variant="outlined"
                                    hide-details
                                ></v-text-field>
                            </template>
                        </v-slider>
                    </td>
                </tr>
                <tr>
                    <th>Maximum R-Script Runtime<br />(in seconds)</th>
                    <td>
                        <v-slider
                            v-model="model.maxRuntime"
                            class="slider"
                            :max="props.maxRuntime.max"
                            :min="props.maxRuntime.min"
                            :step="props.maxRuntime.step"
                            hide-details
                            width="100%"
                        >
                            <template #append>
                                <v-text-field
                                    v-model="model.maxRuntime"
                                    density="compact"
                                    width="140px"
                                    type="number"
                                    variant="outlined"
                                    hide-details
                                ></v-text-field>
                            </template>
                        </v-slider>
                    </td>
                </tr>
            </tbody>
        </v-table>
    </div>
</template>

<style scoped lang="scss">
    .settingsContainer {
        width: 100%;
        display: flex;
        flex-direction: column;

        p {
            margin-top: 2em;
        }
    }

    .settingsTable {
        width: 100%;
        margin-top: 1em;

        th {
            font-weight: 400 !important;
            width: 16em;
            border: 0 !important;
        }
        td {
            border: 0 !important;
        }
        .v-slider {
            margin: 0.5em 0;
        }
    }

    .slider ::v-deep(.v-label) {
        opacity: 1;
    }
</style>
