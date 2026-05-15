import { ref, watch } from "vue";
import { defineStore } from "pinia";
import { useAccountStore } from ".";
import { useSnackbarStore } from "../snackbar";

const LOGIN_DIALOG_STORE_ID = "loginDialog";

export const useLoginDialogStore = defineStore(LOGIN_DIALOG_STORE_ID, () => {
    const account = useAccountStore();
    const snackbar = useSnackbarStore();

    const isOpen = ref(false);
    const username = ref<string>("");
    const password = ref<string>("");
    const errorMessage = ref<string>("");
    const showPass = ref<boolean>(false);

    const reset = () => {
        isOpen.value = false;
        username.value = "";
        password.value = "";
        errorMessage.value = "";
        showPass.value = false;
    };

    const openDialog = () => {
        reset();
        isOpen.value = true;
    };

    const closeDialog = () => {
        reset();
    };

    const login = () => {
        account.login(
            username.value,
            password.value,
            () => {
                snackbar.addSuccessMessage("Successfully logged in!");
                closeDialog();
            },
            () => {
                errorMessage.value = "wrong credentials";
            }
        );
    };

    const register = () => {
        account.register(
            username.value,
            password.value,
            () => {
                snackbar.addSuccessMessage("Successfully registered new account!");
                closeDialog();
            },
            () => {
                errorMessage.value = "username already registered";
            }
        );
    };

    const toggleShowPass = () => {
        showPass.value = !showPass.value;
    };

    // reset error message when username or password is changed
    watch([username, password], () => (errorMessage.value = ""));

    return {
        username,
        password,
        errorMessage,
        showPass,
        isOpen,
        login,
        register,
        openDialog,
        closeDialog,
        toggleShowPass,
        reset
    };
});
