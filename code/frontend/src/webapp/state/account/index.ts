import { doLoginRequest, doLogoutRequest, doRefreshRequest, doRegisterRequest } from "@/backend/authentication";
import { registerUnauthorizedInterceptor } from "@/backend/interceptors";
import { useSessionStorage } from "@vueuse/core";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

const ACCOUNT_STORE_ID = "account";
const REFRESH_INTERVAL = 60000; // 60 seconds

interface TransientAccountState {
    accessToken: string | null;
}

interface PersistedAccountState {
    username: string | null;
    refreshToken: string | null;
}

const getDefaultPersistedAccountState = () => {
    return { username: null, refreshToken: null } as PersistedAccountState;
};

const getDefaultTransientAccountState = () => {
    return { accessToken: null } as TransientAccountState;
};

export const useAccountStore = defineStore(ACCOUNT_STORE_ID, () => {
    const persisted = useSessionStorage(ACCOUNT_STORE_ID, getDefaultPersistedAccountState());
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
            onWrongCredentials
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
        }
    };

    const isLoggedIn = computed(() => {
        return persisted.value.username && persisted.value.refreshToken;
    });

    registerUnauthorizedInterceptor(() => {
        logout();
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
