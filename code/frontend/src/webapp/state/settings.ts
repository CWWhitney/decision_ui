import { defineStore } from "pinia";
import { ref } from "vue";

import * as common from "@decision-support-ui/common";

export const EDITOR_SETTINGS_STORE_ID = "flow.options";

export const useEditorSettingsStore = defineStore(EDITOR_SETTINGS_STORE_ID, () => {
    const locked = ref(false);
    const snapToGrid = ref(true);
    const edgeStyle = ref<common.EdgeStyleType>(common.SMOOTH_STEP_EDGE_STYLE_TYPE);
    const background = ref<common.EditorBackground>(common.DOTS_EDITOR_BACKGROUND);

    const switchEdgeStyle = () => {
        const nextIdx =
            (common.AVAILABLE_EDGE_STYLE_TYPES.indexOf(edgeStyle.value) + 1) % common.AVAILABLE_EDGE_STYLE_TYPES.length;
        edgeStyle.value = common.AVAILABLE_EDGE_STYLE_TYPES[nextIdx] ?? common.SMOOTH_STEP_EDGE_STYLE_TYPE;
    };

    const switchBackground = () => {
        const nextIdx =
            (common.AVAILABLE_EDITOR_BACKGROUNDS.indexOf(background.value) + 1) %
            common.AVAILABLE_EDITOR_BACKGROUNDS.length;
        background.value = common.AVAILABLE_EDITOR_BACKGROUNDS[nextIdx] ?? common.DOTS_EDITOR_BACKGROUND;
    };

    const reset = () => {
        locked.value = false;
        snapToGrid.value = true;
        edgeStyle.value = common.SMOOTH_STEP_EDGE_STYLE_TYPE;
        background.value = common.DOTS_EDITOR_BACKGROUND;
    };

    const toggleLocked = () => {
        locked.value = !locked.value;
    };

    return { locked, snapToGrid, edgeStyle, background, toggleLocked, switchEdgeStyle, switchBackground, reset };
});

export const COMPUTATION_SETTINGS_STORE_ID = "settings.computation";

export const DEFAULT_MC_RUNS = 10000;
export const DEFAULT_HISTOGRAM_BINS = 40;

export const useComputationSettingsStore = defineStore(COMPUTATION_SETTINGS_STORE_ID, () => {
    const mcRuns = ref(DEFAULT_MC_RUNS as number);
    const histogramBins = ref(DEFAULT_HISTOGRAM_BINS as number);

    const reset = () => {
        mcRuns.value = DEFAULT_MC_RUNS;
        histogramBins.value = DEFAULT_MC_RUNS;
    };

    return { mcRuns, histogramBins, reset };
});
