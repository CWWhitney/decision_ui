import { ref } from "vue";
import { defineStore } from "pinia";

const AI_SUPPORT_DIALOG_STORE_ID = "aiSupportDialog";

export const useAiSupportDialogStore = defineStore(AI_SUPPORT_DIALOG_STORE_ID, () => {
    const isOpen = ref(false);

    const reset = () => {
        isOpen.value = false;
    };

    const openDialog = () => {
        isOpen.value = true;
    };

    const closeDialog = () => {
        isOpen.value = false;
    };

    return { isOpen, openDialog, closeDialog, reset };
});
