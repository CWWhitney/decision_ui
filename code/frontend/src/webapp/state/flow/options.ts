import { defineStore } from "pinia";
import { ref } from "vue";

export const FLOW_OPTIONS_STORE_ID = "flow.options";

export const useFlowOptionsStore = defineStore(FLOW_OPTIONS_STORE_ID, () => {
  const locked = ref(false);
  const snapToGrid = ref(true);

  const reset = () => {
    locked.value = false;
    snapToGrid.value = true;
  };

  const setLocked = (locked_: boolean) => {
    locked.value = locked_;
  };

  return { locked, snapToGrid, reset, setLocked };
});
