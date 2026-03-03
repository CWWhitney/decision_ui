import { ref } from "vue";
import { defineStore } from "pinia";

const LOGIN_DIALOG_STORE_ID = "loginDialog";

export const useLoginDialogStore = defineStore(LOGIN_DIALOG_STORE_ID, () => {
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
