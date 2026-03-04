import * as common from "@decision-support-ui/common";

import { type Schema } from "ajv";
import type { AxiosError, AxiosResponse } from "axios";

export const AUTHORIZATION_HEADER = (import.meta.env.VITE_BACKEND_AUTH_HEADER || "Authorization").trim();

export const REQUEST_TIMEOUT = 2000;

const _getBackendBaseURL = async (): Promise<string> => {
    if (window && (window as any).api && (window as any).api.getBackendBaseURL) {
        // webapp was started with electron
        return await (window as any).api.getBackendBaseURL();
    } else {
        // webapp was started from browser
        return import.meta.env.VITE_BACKEND_BASE_URL || "";
    }
};

let _cachedBackendBaseUrl: string | null = null;

export const getBackendBaseURL = async () => {
    if (!_cachedBackendBaseUrl) {
        _cachedBackendBaseUrl = await _getBackendBaseURL();
    }
    return _cachedBackendBaseUrl;
};

export const validateAxiosResponse = (schema: Schema) => {
    const validateSuccessSchema = common.validateSchema(schema);
    const validateErrorSchema = common.validateSchema(common.ErrorResponseSchema);

    return (
        responsePromise: Promise<AxiosResponse>,
        onSuccess: (response: AxiosResponse) => void,
        onValidationError: (message: string) => void,
        onError: (error: AxiosError) => void
    ) => {
        responsePromise
            .then((response: AxiosResponse) => {
                const validationError = validateSuccessSchema(response.data as any);
                if (!validationError) {
                    return onSuccess(response);
                }
                return onValidationError(`server claims success but responds with invalid data:\n\n${validationError}`);
            })
            .catch((error: AxiosError) => {
                if (error.response && error.response.data) {
                    const validationError = validateErrorSchema(error.response.data as any);
                    if (!validationError) {
                        const data = error.response.data as common.ErrorResponseBody;
                        if (error.response.status == 400) {
                            return onValidationError(data.error);
                        }
                        return onError(error);
                    }
                    return onValidationError(`error while parsing error response:\n\n${validationError}`);
                }
                return onError(error);
            });
    };
};
