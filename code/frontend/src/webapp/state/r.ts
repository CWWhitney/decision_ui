import { defineStore } from "pinia";
import { useGraphStore } from "./graph";

import * as common from "@decision-support-ui/common";
import { computed, ref } from "vue";
import { generateCalculateResultHistogramRequest } from "@/rest/r";
import { useAccountStore } from "./account";
import { useErrorDialogStore } from "./error_dialog";
import { useComputationStore } from "./computation";

const R_STORE_ID = "rCode";

export type RExecutionStatus = "success" | "failed" | "in_progress" | "pending";

export const R_EXECUTION_SUCCESS = "success";
export const R_EXECUTION_FAILED = "failed";
export const R_EXECUTION_IN_PROGRESS = "in_progress";
export const R_EXECUTION_PENDING = "pending";

interface RStoreState {
    resultHistogram: {
        status: RExecutionStatus;
        data: common.CalculateResultHistogramData | null;
        execution: common.RExecutionState | null;
    };
    evpi: {
        script: string | null;
        estimates: string | null;
        data: string | null;
        error: string | null;
    };
    errorDialog: {
        show: boolean;
        execution: common.RExecutionState | null;
    };
}

const getDefaultState = (): RStoreState => {
    return {
        resultHistogram: {
            status: R_EXECUTION_PENDING,
            data: null,
            execution: null
        },
        evpi: {
            script: null,
            estimates: null,
            data: null,
            error: null
        },
        errorDialog: {
            show: false,
            execution: null
        }
    };
};

export const useRStore = defineStore(R_STORE_ID, () => {
    const getRCodeForExpression = common.getExpressionRCodeGenerator();
    const doCalculateResultHistogramRequest = generateCalculateResultHistogramRequest();

    const account = useAccountStore();
    const errorDialog = useErrorDialogStore();
    const computation = useComputationStore();

    const graph = useGraphStore();

    const state = ref<RStoreState>(getDefaultState());

    const getRCodeFragementForNode = (nodeId: common.NodeId, existingVariables: string[]): common.RCodeFragment => {
        return common.getRCodeFragmentForNodeRecursion(
            nodeId,
            existingVariables,
            graph.getComputedNode,
            graph.getComputedVariableDependencies,
            graph.getComputedNodeIdFromVariableName,
            getRCodeForExpression,
            getRCodeFragementForNode
        );
    };

    const computedModelFunctionFragment = computed(() => {
        try {
            const resultNodes = graph.state.nodes.filter(
                n => n.type == common.VARIABLE_NODE_TYPE && n.function.type == common.RESULT_FUNCTION_TYPE
            ) as common.VariableNode[];
            return common.getCombinedRCodeFragmentForVariableDependencies(resultNodes, [], getRCodeFragementForNode);
        } catch (e) {
            console.error(`error generating r code`, e);
        }

        return null;
    });

    const computedRHistogramCode = computed(() => {
        if (computedModelFunctionFragment.value?.code) {
            const resultVariables = graph.state.nodes
                .filter(n => n.type == common.VARIABLE_NODE_TYPE && n.function.type == common.RESULT_FUNCTION_TYPE)
                .map(n => (n as common.VariableNode).function.variable);

            return common.getRCodeHistogramTemplate(
                computedModelFunctionFragment.value.code,
                resultVariables,
                "estimates.csv",
                "results.csv",
                computation.persisted.backend.mcRuns,
                computation.persisted.backend.histogramBins
            );
        }

        return null;
    });

    const computedREvpiCode = computed(() => {
        if (computedModelFunctionFragment.value?.code) {
            const resultVariables = graph.state.nodes
                .filter(n => n.type == common.VARIABLE_NODE_TYPE && n.function.type == common.RESULT_FUNCTION_TYPE)
                .map(n => (n as common.VariableNode).function.variable);

            return common.getRCodeEvpiTemplate(
                computedModelFunctionFragment.value.code,
                resultVariables,
                "estimates.csv",
                "results.csv",
                computation.persisted.backend.mcRuns
            );
        }

        return null;
    });

    const calculateResultHistogram = () => {
        const accessToken = account.transient.accessToken;
        if (accessToken) {
            state.value.resultHistogram.status = R_EXECUTION_IN_PROGRESS;
            state.value.resultHistogram.data = null;
            state.value.resultHistogram.execution = null;

            doCalculateResultHistogramRequest({
                accessToken,
                graph: graph.state,
                computation: computation.persisted.backend,
                onSuccess: (data: common.CalculateResultHistogramData) => {
                    state.value.resultHistogram.status = R_EXECUTION_SUCCESS;
                    state.value.resultHistogram.data = data;
                },
                onFailed: (execution: common.RExecutionState) => {
                    state.value.resultHistogram.status = R_EXECUTION_FAILED;
                    state.value.resultHistogram.execution = execution;
                    state.value.errorDialog.show = true;
                    state.value.errorDialog.execution = execution;
                },
                onError: message => {
                    state.value.resultHistogram.status = R_EXECUTION_FAILED;
                    errorDialog.openDialog(
                        `Calculating Result Histogram Failed`,
                        `There was a technical error while calculating the result histogram. ` +
                            `Please report this as a bug.`,
                        message
                    );
                }
            });
        }
    };

    graph.$subscribe(() => {
        // graph state has changed, reset state
        reset();
    });

    computation.$subscribe(() => {
        // computation settings changed, reset state
        reset();
    });

    const reset = () => {
        state.value = getDefaultState();
    };

    return {
        state,
        computedRHistogramCode,
        computedREvpiCode,
        calculateResultHistogram,
        reset
    };
});
