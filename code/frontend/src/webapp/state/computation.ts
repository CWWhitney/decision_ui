import { defineStore } from "pinia";
import { ref } from "vue";

export const COMPUTATION_STORE_ID = "settings.computation";

export const DEFAULT_MC_RUNS = 10000;
export const DEFAULT_HISTOGRAM_BINS = 40;

export const useComputationStore = defineStore(COMPUTATION_STORE_ID, () => {
    const mcRuns = ref(DEFAULT_MC_RUNS as number);
    const histogramBins = ref(DEFAULT_HISTOGRAM_BINS as number);

    const reset = () => {
        mcRuns.value = DEFAULT_MC_RUNS;
        histogramBins.value = DEFAULT_HISTOGRAM_BINS;
    };

    return { mcRuns, histogramBins, reset };
});
