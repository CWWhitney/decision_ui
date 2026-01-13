import { defineStore } from "pinia";
import { ref } from "vue";

export const SMOOTH_STEP_EDGE_TYPE = "smooth-step";
export const BEZIER_EDGE_TYPE = "bezier";
export const STRAIGHT_EDGE_TYPE = "straight";

export type EdgeType = "smooth-step" | "bezier" | "straight";
export const AVAILABLE_EDGE_TYPES = [SMOOTH_STEP_EDGE_TYPE, BEZIER_EDGE_TYPE, STRAIGHT_EDGE_TYPE] as EdgeType[];

export const DOTS_BACKGROUND = "dots";
export const LINES_BACKGROUND = "lines";
export const NO_BACKGROUND = "none";

export type Background = "dots" | "lines" | "none";
export const AVAILABLE_BACKGROUNDS = [DOTS_BACKGROUND, LINES_BACKGROUND, NO_BACKGROUND] as Background[];

export const FLOW_STYLE_STORE_ID = "flow.style";

export const useFlowStyleStore = defineStore(FLOW_STYLE_STORE_ID, () => {
  const edgeType = ref(SMOOTH_STEP_EDGE_TYPE as EdgeType);
  const background = ref(DOTS_BACKGROUND as Background);

  const reset = () => {
    edgeType.value = SMOOTH_STEP_EDGE_TYPE;
    background.value = DOTS_BACKGROUND;
  };

  const switchEdgeType = () => {
    const nextIdx = (AVAILABLE_EDGE_TYPES.indexOf(edgeType.value) + 1) % AVAILABLE_EDGE_TYPES.length;
    edgeType.value = AVAILABLE_EDGE_TYPES[nextIdx] ?? SMOOTH_STEP_EDGE_TYPE;
  };

  const switchBackground = () => {
    const nextIdx = (AVAILABLE_BACKGROUNDS.indexOf(background.value) + 1) % AVAILABLE_BACKGROUNDS.length;
    background.value = AVAILABLE_BACKGROUNDS[nextIdx] ?? DOTS_BACKGROUND;
  };

  return { edgeType, background, switchEdgeType, switchBackground, reset };
});
