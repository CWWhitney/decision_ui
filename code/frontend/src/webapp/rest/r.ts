import axios, { AxiosError, type AxiosResponse } from "axios";

import * as common from "@decision-support-ui/common";
import { BEARER_HEADER, getBackendBaseURL, validateAxiosResponse } from "./common";

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
        computation: common.BackendComputationState;
        onSuccess?: (data: common.CalculateResultHistogramData) => void;
        onFailed?: (execution: common.RExecutionState) => void;
        onError?: (error: string) => void;
    }) => {
        return validateResponse(
            axios.post(
                (await getBackendBaseURL()) + "/api/r/calculate_result_histogram",
                { graph, computation } as common.CalculateResultHistogramRequestBody,
                {
                    headers: { "Content-Type": "application/json", [BEARER_HEADER]: `Bearer ${accessToken}` },
                    timeout: DSUI_R_MAX_RUNTIME
                }
            ),
            (response: AxiosResponse) => {
                if (response.status === 200) {
                    const responseData = response.data as common.CalculateResultHistogramResult;
                    if (responseData.execution.exitcode == 0) {
                        return onSuccess(responseData.data);
                    } else {
                        return onFailed(responseData.execution);
                    }
                }
                return onError(`unknown success status '${response.status}' while adding model`);
            },
            (message: string) => {
                console.error(`validation error while calculating result histogram:\n\n${message}`);
                return onError(message);
            },
            (error: AxiosError) => {
                console.error(`unknown axios error`, error);
                return onError(error.message);
            }
        );
    };
};
