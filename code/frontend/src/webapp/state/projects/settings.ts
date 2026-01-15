import { defineStore } from "pinia";
import { ref } from "vue";

export const FLOW_STYLE_STORE_ID = "project.settings";

export const DEFAULT_MC_RUNS = 10;

export const useProjectSettingsStore = defineStore(FLOW_STYLE_STORE_ID, () => {
  const mcRuns = ref(DEFAULT_MC_RUNS as number);

  const reset = () => {
    mcRuns.value = DEFAULT_MC_RUNS;
  };

  return { mcRuns, reset };
});
