import { ref } from "vue";
import { defineStore } from "pinia";

const ERROR_DIALOG_STORE_ID = "errorDialog";

export const useErrorDialogStore = defineStore(ERROR_DIALOG_STORE_ID, () => {
    const isOpen = ref(false);
    const title = ref("");
    const message = ref("");
    const details = ref("");

    const reset = () => {
        isOpen.value = false;
        title.value = "";
        message.value = "";
        details.value = "";
    };

    const openDialog = (newTitle: string, newMessage: string, newDetails: string = "") => {
        isOpen.value = true;
        title.value = newTitle;
        message.value = newMessage;
        details.value = newDetails;
    };

    const closeDialog = () => {
        isOpen.value = false;
        title.value = "";
        message.value = "";
        details.value = "";
    };

    return { title, message, details, isOpen, openDialog, closeDialog, reset };
});
