import { defineStore } from "pinia";
import { ref } from "vue";

export const FLOW_OPTIONS_STORE_ID = "flow.options";

export const useFlowOptionsStore = defineStore(FLOW_OPTIONS_STORE_ID, () => {
    const locked = ref(false);
    const snapToGrid = ref(true);
    const focused = ref(false);

    const reset = () => {
        locked.value = false;
        snapToGrid.value = true;
    };

    const setLocked = (l: boolean) => {
        locked.value = l;
    };

    const toggleLocked = () => {
        locked.value = !locked.value;
    };

    const setFocused = (f: boolean) => {
        focused.value = f;
    };

    return { locked, snapToGrid, focused, reset, setLocked, toggleLocked, setFocused };
});
