import { useSessionStorage } from "@vueuse/core";
import { defineStore } from "pinia";

export const COMPUTATION_STORE_ID = "computation";

export const DEFAULT_MC_RUNS = 10000;
export const DEFAULT_HISTOGRAM_BINS = 40;

const getDefaultComputationState = () => {
    return {
        mcRuns: 10000,
        histogramBins: 40
    };
};

export const useComputationStore = defineStore(COMPUTATION_STORE_ID, () => {
    // --- persisted state
    const state = useSessionStorage(COMPUTATION_STORE_ID, getDefaultComputationState());

    const reset = () => {
        state.value = getDefaultComputationState();
    };

    return { state, reset };
});
