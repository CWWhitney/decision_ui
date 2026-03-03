import axios, { AxiosError, type AxiosResponse } from "axios";
import { getBackendBaseURL, REQUEST_TIMEOUT } from "./common";

export const doLoginRequest = async ({
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
}): Promise<void> => {
    return axios
        .post(
            (await getBackendBaseURL()) + "/api/auth/jwt/login",
            { username, password },
            {
                headers: { "Content-Type": "application/json" },
                timeout: REQUEST_TIMEOUT
            }
        )
        .then((response: AxiosResponse) => {
            if (response.status === 200) {
                return onSuccess(response.data.accessToken, response.data.refreshToken);
            }
        })
        .catch((error: AxiosError) => {
            if (error.code === "ERR_BAD_REQUEST" && error.status == 400) {
                return onWrongCredentials();
            } else {
                console.error(`unknown error logging in`, error);
                return onError(error.message);
            }
        });
};

export const doRefreshRequest = async ({
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
    axios
        .post(
            (await getBackendBaseURL()) + "/api/auth/jwt/refresh",
            { refreshToken },
            {
                headers: { "Content-Type": "application/json" },
                timeout: REQUEST_TIMEOUT
            }
        )
        .then((response: AxiosResponse) => {
            if (response.status === 200) {
                return onSuccess(response.data.access_token, response.data.refreshToken);
            }
        })
        .catch((error: AxiosError) => {
            if (error.code === "ERR_BAD_REQUEST" && error.status == 400) {
                return onInvalidToken();
            } else {
                console.error(`unknown error refreshing login token`, error);
                return onError(error.message);
            }
        });
};

export const doLogoutRequest = async ({ refreshToken }: { refreshToken: string }): Promise<void> => {
    return axios
        .post(
            (await getBackendBaseURL()) + "/api/auth/jwt/logout",
            { refreshToken },
            {
                headers: { "Content-Type": "application/json" },
                timeout: REQUEST_TIMEOUT
            }
        )
        .then(() => {
            return;
        })
        .catch((error: AxiosError) => {
            console.error(`error logging out`, error);
        });
};

export const doRegisterRequest = async ({
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
    return axios
        .post(
            (await getBackendBaseURL()) + "/api/auth/register",
            { username, password },
            {
                headers: { "Content-Type": "application/json" },
                timeout: REQUEST_TIMEOUT
            }
        )
        .then((response: AxiosResponse) => {
            if (response.status === 200) {
                return onSuccess();
            }
        })
        .catch((error: AxiosError) => {
            if (error.code === "ERR_BAD_REQUEST" && error.status == 400) {
                return onUsernameTaken();
            } else {
                console.error(`unknown error registering new account`, error);
                return onError(error.message);
            }
        });
};
