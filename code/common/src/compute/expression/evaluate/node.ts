import * as tf from "@tensorflow/tfjs";

import { VariableDependencies } from "../dependencies/semantics";
import {
    AbstractNode,
    ESTIMATE_FUNCTION_TYPE,
    EstimateNodeFunctionState,
    LOOP_FUNCTION_TYPE,
    LoopFunctionType,
    LoopNodeFunctionState,
    Node,
    NodeFunctionType,
    NodeId,
    OPERATION_FUNCTION_TYPE,
    OperationFunctionType,
    OperationNodeFunctionState,
    RESULT_FUNCTION_TYPE,
    ResultFunctionType,
    ResultNodeFunctionState,
    VARIABLE_NODE_TYPE,
    VariableNodeType
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
import { toProbabilistic } from "../../math/broadcast";
import { SucceededMatchResult } from "ohm-js";
import { matchExpression } from "./match";

interface AbstractFunctionExpressionMatch<T extends NodeFunctionType> {
    type: T;
}

interface OperationFunctionExpressionMatches extends AbstractFunctionExpressionMatch<OperationFunctionType> {
    expressionMatch: SucceededMatchResult;
}

interface LoopFunctionExpressionMatches extends AbstractFunctionExpressionMatch<LoopFunctionType> {
    initExpressionMatch: SucceededMatchResult;
    iterExpressionMatch: SucceededMatchResult;
}

interface ResultFunctionExpressionMatches extends AbstractFunctionExpressionMatch<ResultFunctionType> {
    expressionMatch: SucceededMatchResult;
}

type EstimateFunctionExpressionMatches = null;

export type NodeFunctionExpressionMatches =
    | EstimateFunctionExpressionMatches
    | OperationFunctionExpressionMatches
    | LoopFunctionExpressionMatches
    | ResultFunctionExpressionMatches;

export const getExpressionMatchesForOperationFunction = (node: Node): OperationFunctionExpressionMatches => {
    if (node.function.type != OPERATION_FUNCTION_TYPE) {
        throw new Error(`cannot match expressions for node of type '${node.type}'`);
    }

    return {
        type: OPERATION_FUNCTION_TYPE,
        expressionMatch: matchExpression(node.function.expression)
    };
};

export const getExpressionMatchesForLoopFunction = (node: Node): LoopFunctionExpressionMatches => {
    if (node.function.type != LOOP_FUNCTION_TYPE) {
        throw new Error(`cannot match expressions for node of type '${node.type}'`);
    }

    return {
        type: LOOP_FUNCTION_TYPE,
        initExpressionMatch: matchExpression(node.function.initExpression),
        iterExpressionMatch: matchExpression(node.function.iterExpression)
    };
};

export const getExpressionMatchesForResultFunction = (node: Node): ResultFunctionExpressionMatches => {
    if (node.function.type != RESULT_FUNCTION_TYPE) {
        throw new Error(`cannot match expressions for node of type '${node.type}'`);
    }

    return {
        type: RESULT_FUNCTION_TYPE,
        expressionMatch: matchExpression(node.function.expression)
    };
};

export const getExpressionMatchesForNode = (node: Node): NodeFunctionExpressionMatches | null => {
    if (node.type != VARIABLE_NODE_TYPE) {
        throw new Error(`cannot match expression for non-variable node '${node.id}'`);
    }
    if (node.function.type == ESTIMATE_FUNCTION_TYPE) {
        return null;
    } else if (node.function.type == OPERATION_FUNCTION_TYPE) {
        return getExpressionMatchesForOperationFunction(node);
    } else if (node.function.type == LOOP_FUNCTION_TYPE) {
        return getExpressionMatchesForLoopFunction(node);
    } else if (node.function.type == RESULT_FUNCTION_TYPE) {
        return getExpressionMatchesForResultFunction(node);
    }
    throw new Error(`unknown variable node function type '${(node as any).function.type}' when matching expressions`);
};

export const getTypedTensorForEstimateNode = (
    node: AbstractNode<VariableNodeType, EstimateNodeFunctionState, any>,
    context: ComputationContext
): TypedTensor => {
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
    node: AbstractNode<VariableNodeType, OperationNodeFunctionState | ResultNodeFunctionState, any>,
    expressionMatches: OperationFunctionExpressionMatches | ResultFunctionExpressionMatches,
    getVariableDependencies: (nodeId: string) => VariableDependencies,
    getNodeIdForVariable: (variable: string) => NodeId,
    evaluateExpressionMatches: (match: SucceededMatchResult, expressionContext: ExpressionTensorContext) => TypedTensor,
    getTypedTensorForNode: (nodeId: string) => TypedTensor,
    computationContext: ComputationContext
): TypedTensor => {
    const expressionContext: ExpressionTensorContext = {
        tensorByVariable: {},
        mcRuns: computationContext.mcRuns,
        index: null
    };
    for (const variable of getVariableDependencies(node.id)) {
        expressionContext.tensorByVariable[variable] = getTypedTensorForNode(getNodeIdForVariable(variable));
    }

    return tf.tidy(() => evaluateExpressionMatches(expressionMatches.expressionMatch, expressionContext));
};

export const getTypedTensorForLoopOperationNode = (
    node: AbstractNode<VariableNodeType, LoopNodeFunctionState, any>,
    expressionMatches: LoopFunctionExpressionMatches,
    getNode: (nodeId: string) => Node,
    getVariableDependencies: (nodeId: string) => VariableDependencies,
    getNodeIdForVariable: (variable: string) => NodeId,
    evaluateExpressionMatch: (match: SucceededMatchResult, expressionContext: ExpressionTensorContext) => TypedTensor,
    getTypedTensorForNode: (nodeId: string) => TypedTensor,
    computationContext: ComputationContext
): TypedTensor => {
    const { iterations } = node.function;

    // determine all required variable values as tensors
    const expressionContext: ExpressionTensorContext = {
        tensorByVariable: {},
        mcRuns: computationContext.mcRuns,
        index: {
            iteration: 0,
            length: iterations
        }
    };
    for (const variable of getVariableDependencies(node.id)) {
        expressionContext.tensorByVariable[variable] = getTypedTensorForNode(getNodeIdForVariable(variable));
    }

    return tf.tidy(() => {
        let tensorList = [] as TypedTensor[];
        const initTensor = evaluateExpressionMatch(expressionMatches.initExpressionMatch, expressionContext);

        tensorList.push(initTensor);
        for (let i = 1; i < iterations; i++) {
            const iterTensor = evaluateExpressionMatch(expressionMatches.iterExpressionMatch, {
                ...expressionContext,
                index: {
                    ...expressionContext.index,
                    iteration: i
                },
                tensorByVariable: {
                    ...expressionContext.tensorByVariable,
                    i: getTypedTensorFromConstant(tf.scalar(i)),
                    previous: tensorList[i - 1]
                }
            });
            tensorList.push(iterTensor);
        }

        // check if any tensor is probabilistic and broadcast all others if so
        const isAnyProbabilistic = tensorList.reduce((p, t) => p || t.isProbabilistic, false);
        if (isAnyProbabilistic) {
            tensorList = tensorList.map(t => toProbabilistic(t, computationContext.mcRuns));
        }

        return {
            tensor: tf.stack(
                tensorList.map(t => t.tensor),
                -1
            ),
            isProbabilistic: isAnyProbabilistic,
            isSeries: true
        };
    });
};

export const getTypedTensorForNodeRecursion = (
    nodeId: string,
    getNode: (nodeId: string) => Node,
    getVariableDependencies: (nodeId: string) => VariableDependencies,
    getNodeIdForVariable: (variable: string) => NodeId,
    getExpressionMatchesForNode: (nodeId: string) => NodeFunctionExpressionMatches,
    evaluateExpressionMatch: (match: SucceededMatchResult, expressionContext: ExpressionTensorContext) => TypedTensor,
    getTypedTensorForNode: (nodeId: string) => TypedTensor,
    computationContext: ComputationContext
): TypedTensor => {
    const node = getNode(nodeId);
    if (node.function.type == ESTIMATE_FUNCTION_TYPE) {
        return getTypedTensorForEstimateNode(
            node as AbstractNode<VariableNodeType, EstimateNodeFunctionState, any>,
            computationContext
        );
    } else if (node.function.type == OPERATION_FUNCTION_TYPE || node.function.type == RESULT_FUNCTION_TYPE) {
        return getTypedTensorForNodeWithExpression(
            node as AbstractNode<VariableNodeType, OperationNodeFunctionState | ResultNodeFunctionState, any>,
            getExpressionMatchesForNode(nodeId) as OperationFunctionExpressionMatches | ResultFunctionExpressionMatches,
            getVariableDependencies,
            getNodeIdForVariable,
            evaluateExpressionMatch,
            getTypedTensorForNode,
            computationContext
        );
    } else if (node.function.type == LOOP_FUNCTION_TYPE) {
        return getTypedTensorForLoopOperationNode(
            node as AbstractNode<VariableNodeType, LoopNodeFunctionState, any>,
            getExpressionMatchesForNode(nodeId) as LoopFunctionExpressionMatches,
            getNode,
            getVariableDependencies,
            getNodeIdForVariable,
            evaluateExpressionMatch,
            getTypedTensorForNode,
            computationContext
        );
    }
    throw new Error(`unknown node type ${node.type}`);
};
