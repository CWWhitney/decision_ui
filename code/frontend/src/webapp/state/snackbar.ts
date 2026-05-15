import { defineStore } from "pinia";

import { ref } from "vue";
import { type SnackbarQueueMessage } from "vuetify";
import { registerNetworkErrorInterceptor, registerUnauthorizedInterceptor } from "../rest/interceptors";

export const SNACKBAR_STORE_ID = "snackbar";

const DEFAULT_SNACKBAR_TIMEOUT = 3000;

export const useSnackbarStore = defineStore(SNACKBAR_STORE_ID, () => {
    // state
    const messages = ref<SnackbarQueueMessage[]>([]);

    const reset = () => {
        messages.value = [];
    };

    const addSuccessMessage = (message: string, timeout: number = DEFAULT_SNACKBAR_TIMEOUT) => {
        messages.value.push({
            text: message,
            color: "success",
            timeout
        });
    };

    const addInfoMessage = (message: string, timeout: number = DEFAULT_SNACKBAR_TIMEOUT) => {
        messages.value.push({
            text: message,
            color: "info",
            timeout
        });
    };

    registerNetworkErrorInterceptor(() => {
        messages.value.push({
            text: "No connection to server!",
            color: "error",
            timeout: DEFAULT_SNACKBAR_TIMEOUT
        });
    });

    registerUnauthorizedInterceptor(() => {
        messages.value.push({
            text: "Authentication failed! Please log in again.",
            color: "error",
            timeout: DEFAULT_SNACKBAR_TIMEOUT
        });
    });

    return {
        messages,
        reset,
        addInfoMessage,
        addSuccessMessage
    };
});
