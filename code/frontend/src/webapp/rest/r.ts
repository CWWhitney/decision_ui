import axios, { AxiosError, type AxiosResponse } from "axios";

import * as common from "@decision-support-ui/common";
import { getBackendBaseURL, validateAxiosResponse } from "./common";
import { DSUI_BEARER_HEADER } from "../common/constants";

export const DSUI_R_MAX_RUNTIME = parseInt(import.meta.env.VITE_DSUI_R_MAX_RUNTIME) || 30000;

export const generateCalculateResultHistogramRequest = () => {
    const validateResponse = validateAxiosResponse(common.CalculateResultHistogramResponseSchema);
    return async ({
        accessToken,
        graph,
        computation,
        onSuccess = () => {},
        onFailed = () => {},
        onError = () => {}
    }: {
        accessToken: string;
        graph: common.Graph;
        computation: common.BackendResultHistogramComputationState;
        onSuccess?: (data: common.CalculateResultHistogramData) => void;
        onFailed?: (execution: common.RExecutionError) => void;
        onError?: (error: string) => void;
    }) => {
        return validateResponse(
            axios.post(
                (await getBackendBaseURL()) + "/api/r/calculate_result_histogram",
                { graph, computation } as common.CalculateResultHistogramRequestBody,
                {
                    headers: { "Content-Type": "application/json", [DSUI_BEARER_HEADER]: `Bearer ${accessToken}` },
                    timeout: DSUI_R_MAX_RUNTIME
                }
            ),
            (response: AxiosResponse) => {
                if (response.status === 200) {
                    const responseData = response.data as common.CalculateResultHistogramResult;
                    if (responseData.data && !responseData.error) {
                        return onSuccess(responseData.data);
                    } else {
                        return onFailed(responseData.error);
                    }
                }
                return onError(`unknown success status '${response.status}' after calculating result histogram`);
            },
            (message: string) => {
                console.error(`validation error while calculating result histogram:\n\n${message}`);
                return onError(message);
            },
            (error: AxiosError) => {
                console.error(`unknown axios error`, error);
                if (error.response?.data) {
                    const data = error.response?.data as common.ErrorResponseBody;
                    if (data && data.error) {
                        return onError(data.error);
                    }
                }
                return onError(error.message);
            }
        );
    };
};

export const generateCalculateEvpiRequest = () => {
    const validateResponse = validateAxiosResponse(common.CalculateEvpiResponseSchema);
    return async ({
        accessToken,
        graph,
        computation,
        onSuccess = () => {},
        onFailed = () => {},
        onError = () => {}
    }: {
        accessToken: string;
        graph: common.Graph;
        computation: common.BackendEvpiComputationState;
        onSuccess?: (data: common.CalculateEvpiData) => void;
        onFailed?: (error: common.RExecutionError) => void;
        onError?: (error: string) => void;
    }) => {
        return validateResponse(
            axios.post(
                (await getBackendBaseURL()) + "/api/r/calculate_evpi",
                { graph, computation } as common.CalculateResultHistogramRequestBody,
                {
                    headers: { "Content-Type": "application/json", [DSUI_BEARER_HEADER]: `Bearer ${accessToken}` },
                    timeout: DSUI_R_MAX_RUNTIME
                }
            ),
            (response: AxiosResponse) => {
                if (response.status === 200) {
                    const responseData = response.data as common.CalculateEvpiResult;
                    if (responseData.data && !responseData.error) {
                        return onSuccess(responseData.data);
                    } else {
                        return onFailed(responseData.error);
                    }
                }
                return onError(`unknown success status '${response.status}' after calculating evpi`);
            },
            (message: string) => {
                console.error(`validation error while calculating evpi:\n\n${message}`);
                return onError(message);
            },
            (error: AxiosError) => {
                console.error(`unknown axios error`, error);
                if (error.response?.data) {
                    const data = error.response?.data as common.ErrorResponseBody;
                    if (data && data.error) {
                        return onError(data.error);
                    }
                }
                return onError(error.message);
            }
        );
    };
};
