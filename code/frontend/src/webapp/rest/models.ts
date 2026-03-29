import {
    AddModelResponseSchema,
    DeleteModelResponseSchema,
    GetModelResponseSchema,
    ListModelsResponseSchema,
    UpdateModelResponseSchema,
    type AddModelRequestBody,
    type ListModelsEntry,
    type ModelFileState,
    type UpdateModelRequestBody
} from "@decision-support-ui/common";
import { getBackendBaseURL, validateAxiosResponse } from "./common";
import axios, { AxiosError, type AxiosResponse } from "axios";
import { DSUI_BEARER_HEADER, DSUI_REQUEST_TIMEOUT } from "../common/constants";

export const generateListModelsRequest = () => {
    const validateResponse = validateAxiosResponse(ListModelsResponseSchema);
    return async ({
        accessToken,
        onSuccess = () => {},
        onError = () => {}
    }: {
        accessToken: string;
        onSuccess?: (models: ListModelsEntry[]) => void;
        onError?: (message: string) => void;
    }) => {
        return validateResponse(
            axios.get((await getBackendBaseURL()) + "/api/models/for_user", {
                headers: {
                    [DSUI_BEARER_HEADER]: `Bearer ${accessToken}`
                },
                timeout: DSUI_REQUEST_TIMEOUT
            }),
            (response: AxiosResponse) => {
                if (response.status === 200) {
                    return onSuccess(response.data.models);
                }
                return onError(`unknown success status '${response.status}' while retrieving model list`);
            },
            (message: string) => {
                console.error(`validation error while retrieving model list:\n\n${message}`);
                return onError(message);
            },
            (error: AxiosError) => {
                console.error(`unknown axios error`, error);
                return onError(error.message);
            }
        );
    };
};

export const generateAddModelRequest = () => {
    const validateResponse = validateAxiosResponse(AddModelResponseSchema);
    return async ({
        accessToken,
        modelfile,
        onSuccess = () => {},
        onMaxModelsReached = () => {},
        onError = () => {}
    }: {
        accessToken: string;
        modelfile: ModelFileState;
        onSuccess?: (modelId: number) => void;
        onMaxModelsReached?: () => void;
        onError?: (message: string) => void;
    }) => {
        return validateResponse(
            axios.post((await getBackendBaseURL()) + "/api/models/model", { modelfile } as AddModelRequestBody, {
                headers: { "Content-Type": "application/json", [DSUI_BEARER_HEADER]: `Bearer ${accessToken}` },
                timeout: DSUI_REQUEST_TIMEOUT
            }),
            (response: AxiosResponse) => {
                if (response.status === 200) {
                    return onSuccess(response.data.modelId);
                }
                return onError(`unknown success status '${response.status}' while adding model`);
            },
            (message: string) => {
                console.error(`validation error while adding model:\n\n${message}`);
                return onError(message);
            },
            (error: AxiosError) => {
                if (error.status == 403) {
                    return onMaxModelsReached();
                }
                console.error(`unknown axios error`, error);
                return onError(error.message);
            }
        );
    };
};

export const generateGetModelRequest = () => {
    const validateResponse = validateAxiosResponse(GetModelResponseSchema);
    return async ({
        accessToken,
        modelId,
        onSuccess = () => {},
        onError = () => {}
    }: {
        accessToken: string;
        modelId: number;
        onSuccess?: (modelId: number, modelfile: ModelFileState) => void;
        onError?: (message: string) => void;
    }) => {
        return validateResponse(
            axios.get((await getBackendBaseURL()) + `/api/models/model/${modelId}`, {
                headers: { "Content-Type": "application/json", [DSUI_BEARER_HEADER]: `Bearer ${accessToken}` },
                timeout: DSUI_REQUEST_TIMEOUT
            }),
            (response: AxiosResponse) => {
                if (response.status === 200) {
                    return onSuccess(response.data.id, response.data.modelfile);
                }
                return onError(`unknown success status '${response.status}' while retrieving model`);
            },
            (message: string) => {
                console.error(`validation error while retrieving model:\n\n${message}`);
                return onError(message);
            },
            (error: AxiosError) => {
                console.error(`unknown axios error`, error);
                return onError(error.message);
            }
        );
    };
};

export const generateDeleteModelRequest = () => {
    const validateResponse = validateAxiosResponse(DeleteModelResponseSchema);
    return async ({
        accessToken,
        modelId,
        onSuccess = () => {},
        onError = () => {}
    }: {
        accessToken: string;
        modelId: number;
        onSuccess?: () => void;
        onError?: (message: string) => void;
    }) => {
        return validateResponse(
            axios.delete((await getBackendBaseURL()) + `/api/models/model/${modelId}`, {
                headers: { "Content-Type": "application/json", [DSUI_BEARER_HEADER]: `Bearer ${accessToken}` },
                timeout: DSUI_REQUEST_TIMEOUT
            }),
            (response: AxiosResponse) => {
                if (response.status === 200) {
                    return onSuccess();
                }
                return onError(`unknown success status '${response.status}' while deleting model`);
            },
            (message: string) => {
                console.error(`validation error while deleting model:\n\n${message}`);
                return onError(message);
            },
            (error: AxiosError) => {
                console.error(`unknown axios error`, error);
                return onError(error.message);
            }
        );
    };
};

export const generateUpdateModelRequest = () => {
    const validateResponse = validateAxiosResponse(UpdateModelResponseSchema);
    return async ({
        accessToken,
        modelId,
        modelfile,
        onSuccess = () => {},
        onError = () => {}
    }: {
        accessToken: string;
        modelId: number;
        modelfile: ModelFileState;
        onSuccess?: () => void;
        onError?: (message: string) => void;
    }) => {
        return validateResponse(
            axios.put(
                (await getBackendBaseURL()) + `/api/models/model/${modelId}`,
                { modelfile } as UpdateModelRequestBody,
                {
                    headers: { "Content-Type": "application/json", [DSUI_BEARER_HEADER]: `Bearer ${accessToken}` },
                    timeout: DSUI_REQUEST_TIMEOUT
                }
            ),
            (response: AxiosResponse) => {
                if (response.status === 200) {
                    return onSuccess();
                }
                return onError(`unknown success status '${response.status}' while saving model`);
            },
            (message: string) => {
                console.error(`validation error while saving model:\n\n${message}`);
                return onError(message);
            },
            (error: AxiosError) => {
                console.error(`unknown axios error`, error);
                return onError(error.message);
            }
        );
    };
};
