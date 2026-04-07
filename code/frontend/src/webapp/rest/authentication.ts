import axios, { AxiosError, type AxiosResponse } from "axios";
import { getBackendBaseURL, validateAxiosResponse } from "./common";
import {
    LoginResponseSchema,
    LogoutResponseSchema,
    RefreshResponseSchema,
    RegisterResponseSchema,
    type LoginRequestBody,
    type RefreshRequestBody
} from "@decision-support-ui/common";

import { DSUI_REQUEST_TIMEOUT } from "../common/constants";

export const generateDoLoginRequest = () => {
    const validateResponse = validateAxiosResponse(LoginResponseSchema);

    return async ({
        username,
        password,
        onSuccess = () => {},
        onWrongCredentials = () => {},
        onError = () => {}
    }: {
        username: string;
        password: string;
        onSuccess?: (accessToken: string, refreshToken: string) => void;
        onWrongCredentials?: () => void;
        onError?: (message: string) => void;
    }) => {
        return validateResponse(
            axios.post(
                (await getBackendBaseURL()) + "/api/auth/jwt/login",
                { username, password } as LoginRequestBody,
                {
                    headers: { "Content-Type": "application/json" },
                    timeout: DSUI_REQUEST_TIMEOUT
                }
            ),
            (response: AxiosResponse) => {
                if (response.status === 200) {
                    return onSuccess(response.data.accessToken, response.data.refreshToken);
                }
                return onError(`unknown success status '${response.status}' while logging in`);
            },
            (message: string) => {
                console.error(`Validation error while logging in: ${message}`);
                return onError(message);
            },
            (error: AxiosError) => {
                if (error.status == 403) {
                    return onWrongCredentials();
                }
                console.error(`unknown axios error`, error);
                return onError(error.message);
            }
        );
    };
};

export const generateDoRefreshRequest = () => {
    const validateResponse = validateAxiosResponse(RefreshResponseSchema);

    return async ({
        refreshToken,
        onSuccess = () => {},
        onInvalidToken = () => {},
        onError = () => {}
    }: {
        refreshToken: string;
        onSuccess?: (accessToken: string, refreshToken: string) => void;
        onInvalidToken?: () => void;
        onError?: (message: string) => void;
    }) => {
        return validateResponse(
            axios.post((await getBackendBaseURL()) + "/api/auth/jwt/refresh", { refreshToken } as RefreshRequestBody, {
                headers: { "Content-Type": "application/json" },
                timeout: DSUI_REQUEST_TIMEOUT
            }),
            (response: AxiosResponse) => {
                if (response.status === 200) {
                    return onSuccess(response.data.accessToken, response.data.refreshToken);
                }
                return onError(`unknown success status '${response.status}' while refreshing tokens`);
            },
            (message: string) => {
                console.error(`validation error while refreshing tokens: ${message}`);
                return onError(message);
            },
            (error: AxiosError) => {
                if (error.status == 403) {
                    return onInvalidToken();
                }
                console.error(`unknown error refreshing login token`, error);
                return onError(error.message);
            }
        );
    };
};

export const generateDoLogoutRequest = () => {
    const validateResponse = validateAxiosResponse(LogoutResponseSchema);
    return async ({ refreshToken }: { refreshToken: string }): Promise<void> => {
        return validateResponse(
            axios.post(
                (await getBackendBaseURL()) + "/api/auth/jwt/logout",
                { refreshToken },
                {
                    headers: { "Content-Type": "application/json" },
                    timeout: DSUI_REQUEST_TIMEOUT
                }
            ),
            () => {
                return;
            },
            (message: string) => {
                console.error(`validation error while logging out: ${message}`);
            },
            (error: AxiosError) => {
                console.error(`error logging out`, error);
            }
        );
    };
};

export const generateDoRegisterRequest = () => {
    const validateResponse = validateAxiosResponse(RegisterResponseSchema);
    return async ({
        username,
        password,
        onSuccess = () => {},
        onUsernameTaken = () => {},
        onError = () => {}
    }: {
        username: string;
        password: string;
        onSuccess?: () => void;
        onUsernameTaken?: () => void;
        onError?: (message: string) => void;
    }): Promise<void> => {
        return validateResponse(
            axios.post(
                (await getBackendBaseURL()) + "/api/auth/register",
                { username, password },
                {
                    headers: { "Content-Type": "application/json" },
                    timeout: DSUI_REQUEST_TIMEOUT
                }
            ),
            (response: AxiosResponse) => {
                if (response.status === 200) {
                    return onSuccess();
                }
                return onError(`unknown success status '${response.status}' while registering account`);
            },
            (message: string) => {
                console.error(`validation error while registering account: ${message}`);
                return onError(message);
            },
            (error: AxiosError) => {
                if (error.status == 403) {
                    return onUsernameTaken();
                }
                console.error(`unknown error registering new account`, error);
                return onError(error.message);
            }
        );
    };
};
