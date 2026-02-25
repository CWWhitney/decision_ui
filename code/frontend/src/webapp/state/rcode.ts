import { defineStore } from "pinia";
import { useGraphStore } from "./graph";

import * as common from "@decision-support-ui/common";
import { computed } from "vue";

const R_CODE_STORE_ID = "rCode";

export const useRCodeStore = defineStore(R_CODE_STORE_ID, () => {
    const getRCodeForExpression = common.getExpressionRCodeGenerator();

    const graph = useGraphStore();

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

    const computedRCode = computed(() => {
        try {
            const resultNodes: common.VariableNode[] = graph.state.nodes.filter(
                n => n.type == common.VARIABLE_NODE_TYPE && n.function.type == common.RESULT_FUNCTION_TYPE
            ) as common.VariableNode[];
            const resultVariables = resultNodes.map(n => n.function.variable);

            const modelFunctionFragment = common.getCombinedRCodeFragmentForVariableDependencies(
                resultNodes,
                [],
                getRCodeFragementForNode
            );

            if (modelFunctionFragment.code) {
                return common.getRCodeTemplate(
                    modelFunctionFragment.code,
                    resultVariables,
                    "estimates.csv",
                    "results.csv",
                    5000
                );
            }
        } catch (e) {
            console.error(`error generating r code`, e);
        }

        return null;
    });

    const reset = () => {};

    return { computedRCode, reset };
});
