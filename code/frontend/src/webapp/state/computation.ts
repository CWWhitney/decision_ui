import { defineStore } from "pinia";
import * as common from "@decision-support-ui/common";
import { ref } from "vue";
import { useValidatedSessionStorage } from "./io";

export const COMPUTATION_STORE_ID = "computation";

export const DEFAULT_MC_RUNS = 10000;
export const DEFAULT_HISTOGRAM_BINS = 40;

const getDefaultComputationTransientState = (): common.ComputationTransientState => {
    return {
        seed: 1
    };
};

const getDefaultComputationState = (): common.ComputationFileState => {
    return {
        frontend: {
            mcRuns: 10000,
            histogramBins: 40,
            gpuAcceleration: true
        },
        backend: {
            mcRuns: 10000,
            histogramBins: 40
        }
    };
};

export const useComputationStore = defineStore(COMPUTATION_STORE_ID, () => {
    const validateComputationState = common.validateSchema(common.ComputationFileSchema);

    // --- persisted state
    const transient = ref<common.ComputationTransientState>(getDefaultComputationTransientState());
    const persisted = useValidatedSessionStorage(
        COMPUTATION_STORE_ID,
        getDefaultComputationState(),
        validateComputationState
    );

    const toggleGpuAcceleration = () => {
        persisted.value.frontend.gpuAcceleration = !persisted.value.frontend.gpuAcceleration;
    };

    const triggerRecalculation = () => {
        transient.value.seed += 1;
    };

    const reset = () => {
        persisted.value = getDefaultComputationState();
    };

    return { persisted, transient, triggerRecalculation, toggleGpuAcceleration, reset };
});
