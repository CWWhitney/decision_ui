import * as tf from "@tensorflow/tfjs";

import { VariableDependencies } from "../dependencies/semantics";
import {
    ESTIMATE_FUNCTION_TYPE,
    LOOP_FUNCTION_TYPE,
    Node,
    NodeId,
    OPERATION_FUNCTION_TYPE,
    RESULT_FUNCTION_TYPE
} from "../../../graph";
import {
    DETERMINISTIC_DISTRIBUTION_TYPE,
    getNormalDistributionParameter,
    NORMAL_DISTRIBUTION_TYPE,
    POSNORM_DISTRIBUTION_TYPE,
    TNORM01_DISTRIBUTION_TYPE,
    validateLowerUpperBounds
} from "../../math";
import { ComputationContext } from "../../context";
import {
    get01TruncatedNormalDistributionSample,
    getPositiveNormalDistributionSample,
    validate01TruncatedNormalDistributionParameters,
    validatePositiveNormalDistributionParameters
} from "../../math/distributions/trunc_normal";

import { ExpressionTensorContext } from "./context";
import { getTypedTensorFromConstant, TypedTensor } from "../../tensor";

export const getTypedTensorForEstimateNode = (node: Node, context: ComputationContext): TypedTensor => {
    if (node.function.type != ESTIMATE_FUNCTION_TYPE) {
        throw new Error(`cannot calculate estimate node tensor for node of type '${node.type}'`);
    }

    const { distribution, lower, upper } = node.function;

    if (distribution == DETERMINISTIC_DISTRIBUTION_TYPE) {
        return getTypedTensorFromConstant(tf.scalar(lower));
    } else if (distribution == NORMAL_DISTRIBUTION_TYPE) {
        validateLowerUpperBounds(lower, upper);
        const { mean, stddev } = getNormalDistributionParameter(lower, upper);
        return {
            tensor: tf.randomNormal([context.mcRuns], mean, stddev),
            isProbabilistic: true,
            isSeries: false
        };
    } else if (distribution == POSNORM_DISTRIBUTION_TYPE) {
        validatePositiveNormalDistributionParameters(lower, upper);
        return {
            tensor: tf.tensor1d(getPositiveNormalDistributionSample(lower, upper, context.mcRuns)),
            isProbabilistic: true,
            isSeries: false
        };
    } else if (distribution == TNORM01_DISTRIBUTION_TYPE) {
        validate01TruncatedNormalDistributionParameters(lower, upper);
        return {
            tensor: tf.tensor1d(get01TruncatedNormalDistributionSample(lower, upper, context.mcRuns)),
            isProbabilistic: true,
            isSeries: false
        };
    }

    throw new Error(`distribution '${distribution}' tensor calculation not implemented`);
};

export const getTypedTensorForNodeWithExpression = (
    node: Node,
    getVariableDependencies: (nodeId: string) => VariableDependencies,
    getNodeIdForVariable: (variable: string) => NodeId,
    evaluateExpressionForTensor: (expression: string, expressionContext: ExpressionTensorContext) => TypedTensor,
    getTypedTensorForNode: (nodeId: string) => TypedTensor,
    computationContext: ComputationContext
): TypedTensor => {
    if (!(node.function.type == OPERATION_FUNCTION_TYPE || node.function.type == RESULT_FUNCTION_TYPE)) {
        throw new Error(`cannot calculate operation node tensor for node of type '${node.type}'`);
    }

    const { expression } = node.function;

    // determine all required variable values as tensors
    const expressionContext: ExpressionTensorContext = { tensorByVariable: {}, mcRuns: computationContext.mcRuns };
    for (const variable of getVariableDependencies(node.id)) {
        expressionContext.tensorByVariable[variable] = getTypedTensorForNode(getNodeIdForVariable(variable));
    }

    return tf.tidy(() => evaluateExpressionForTensor(expression, expressionContext));
};

export const getTypedTensorForLoopOperationNode = (
    node: Node,
    getNode: (nodeId: string) => Node,
    getVariableDependencies: (nodeId: string) => VariableDependencies,
    getNodeIdForVariable: (variable: string) => NodeId,
    evaluateExpressionForTensor: (expression: string, expressionContext: ExpressionTensorContext) => TypedTensor,
    getTypedTensorForNode: (nodeId: string) => TypedTensor,
    computationContext: ComputationContext
): TypedTensor => {
    if (node.function.type != LOOP_FUNCTION_TYPE) {
        throw new Error(`cannot calculate loop operation node tensor for node of type '${node.type}'`);
    }

    const { iterations, initExpression, iterExpression } = node.function;

    // determine all required variable values as tensors
    const expressionContext: ExpressionTensorContext = { tensorByVariable: {}, mcRuns: computationContext.mcRuns };
    for (const variable of getVariableDependencies(node.id)) {
        expressionContext.tensorByVariable[variable] = getTypedTensorForNode(getNodeIdForVariable(variable));
    }

    return tf.tidy(() => {
        const tensorList = [] as TypedTensor[];
        const initTensor = evaluateExpressionForTensor(initExpression, expressionContext);
        tensorList.push(initTensor);
        for (let i = 1; i < iterations; i++) {
            const iterTensor = evaluateExpressionForTensor(iterExpression, {
                ...expressionContext,
                tensorByVariable: {
                    ...expressionContext.tensorByVariable,
                    i: getTypedTensorFromConstant(tf.scalar(i)),
                    previous: tensorList[i - 1]
                }
            });
            tensorList.push(iterTensor);
        }
        return {
            tensor: tf.stack(
                tensorList.map(t => t.tensor),
                -1
            ),
            isProbabilistic: tensorList.reduce((p, t) => p || t.isProbabilistic, false),
            isSeries: true
        };
    });
};

export const getTypedTensorForNodeRecursion = (
    nodeId: string,
    getNode: (nodeId: string) => Node,
    getVariableDependencies: (nodeId: string) => VariableDependencies,
    getNodeIdForVariable: (variable: string) => NodeId,
    evaluateExpressionForTensor: (expression: string, expressionContext: ExpressionTensorContext) => TypedTensor,
    getTypedTensorForNode: (nodeId: string) => TypedTensor,
    computationContext: ComputationContext
): TypedTensor => {
    const node = getNode(nodeId);
    if (node.function.type == ESTIMATE_FUNCTION_TYPE) {
        return getTypedTensorForEstimateNode(node, computationContext);
    } else if (node.function.type == OPERATION_FUNCTION_TYPE || node.function.type == RESULT_FUNCTION_TYPE) {
        return getTypedTensorForNodeWithExpression(
            node,
            getVariableDependencies,
            getNodeIdForVariable,
            evaluateExpressionForTensor,
            getTypedTensorForNode,
            computationContext
        );
    } else if (node.function.type == LOOP_FUNCTION_TYPE) {
        return getTypedTensorForLoopOperationNode(
            node,
            getNode,
            getVariableDependencies,
            getNodeIdForVariable,
            evaluateExpressionForTensor,
            getTypedTensorForNode,
            computationContext
        );
    }
    throw new Error(`unknown node type ${node.type}`);
};
