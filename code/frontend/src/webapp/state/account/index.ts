import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { Schema } from "ajv";

import * as common from "@decision-support-ui/common";

import {
    generateDoLoginRequest,
    generateDoRegisterRequest,
    generateDoRefreshRequest,
    generateDoLogoutRequest
} from "../../rest/authentication";
import { registerUnauthorizedInterceptor } from "../../rest/interceptors";
import { useErrorDialogStore } from "../error_dialog";
import { useValidatedSessionStorage } from "../io";
import { useSnackbarStore } from "../snackbar";

const ACCOUNT_STORE_ID = "account";
const REFRESH_INTERVAL = 60000; // 60 seconds

interface TransientAccountState {
    accessToken: string | null;
}

interface PersistedAccountState {
    username: string | null;
    refreshToken: string | null;
}

const PersistedAccountSchema: Schema = {
    title: "PersistedAccountSchema",
    type: "object",
    properties: {
        username: { type: ["string", "null"] },
        refreshToken: { type: ["string", "null"] }
    },
    required: ["username", "refreshToken"]
};

const getDefaultPersistedAccountState = () => {
    return { username: null, refreshToken: null } as PersistedAccountState;
};

const getDefaultTransientAccountState = () => {
    return { accessToken: null } as TransientAccountState;
};

export const useAccountStore = defineStore(ACCOUNT_STORE_ID, () => {
    const snackbar = useSnackbarStore();
    const validatePersistedAccountState = common.validateSchema(PersistedAccountSchema);
    const doLoginRequest = generateDoLoginRequest();
    const doRefreshRequest = generateDoRefreshRequest();
    const doLogoutRequest = generateDoLogoutRequest();
    const doRegisterRequest = generateDoRegisterRequest();

    const errorDialog = useErrorDialogStore();

    const persisted = useValidatedSessionStorage(
        ACCOUNT_STORE_ID,
        getDefaultPersistedAccountState(),
        validatePersistedAccountState
    );
    const transient = ref(getDefaultTransientAccountState());

    const reset = () => {
        persisted.value = getDefaultPersistedAccountState();
        transient.value = getDefaultTransientAccountState();
    };

    const login = async (username: string, password: string, onSuccess: () => void, onWrongCredentials: () => void) => {
        reset();

        await doLoginRequest({
            username,
            password,
            onSuccess: (accessToken: string, refreshToken: string) => {
                persisted.value.username = username;
                persisted.value.refreshToken = refreshToken;
                transient.value.accessToken = accessToken;
                onSuccess();
            },
            onWrongCredentials,
            onError: m =>
                errorDialog.openDialog(
                    "Login Failed",
                    "There was a technical problem while logging in. Please try again later.",
                    m
                )
        });
    };

    const register = async (username: string, password: string, onSuccess: () => void, onUsernameTaken: () => void) => {
        reset();

        await doRegisterRequest({
            username,
            password,
            onSuccess: async () => {
                await login(username, password, onSuccess, () => {});
            },
            onUsernameTaken
        });
    };

    const refresh = async () => {
        const refreshToken = persisted.value.refreshToken;
        if (refreshToken) {
            await doRefreshRequest({
                refreshToken,
                onSuccess: (accessToken: string, refreshToken: string) => {
                    persisted.value.refreshToken = refreshToken;
                    transient.value.accessToken = accessToken;
                },
                onInvalidToken: () => {
                    reset();
                }
            });
        }
    };

    const logout = async () => {
        const refreshToken = persisted.value.refreshToken;
        reset();
        if (refreshToken) {
            await doLogoutRequest({ refreshToken });
            snackbar.addSuccessMessage("Successfully logged out!");
        }
    };

    const isLoggedIn = computed(() => {
        return !!persisted.value.username && !!persisted.value.refreshToken && !!transient.value.accessToken;
    });

    registerUnauthorizedInterceptor(() => {
        reset();
    });

    // keep token fresh
    refresh();
    setInterval(refresh, REFRESH_INTERVAL);

    return {
        persisted,
        transient,
        register,
        login,
        logout,
        refresh,
        reset,
        isLoggedIn
    };
});
