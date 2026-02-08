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
import { ttToProbabilistic } from "../../math/broadcast";
import { SucceededMatchResult } from "ohm-js";
import { matchExpression } from "./match";

interface AbstractFunctionExpressionMatch<T extends NodeFunctionType> {
    type: T;
}

interface OperationFunctionExpressionMatches extends AbstractFunctionExpressionMatch<OperationFunctionType> {
    expressionMatch: SucceededMatchResult;
}

interface LoopFunctionExpressionMatches extends AbstractFunctionExpressionMatch<LoopFunctionType> {
    iterationsExpressionMatch: SucceededMatchResult;
    initExpressionMatch: SucceededMatchResult;
    loopExpressionMatch: SucceededMatchResult;
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

export const getExpressionMatchesForOperationFunction = (
    node: AbstractNode<VariableNodeType, OperationNodeFunctionState, any>
): OperationFunctionExpressionMatches => {
    if (!node.function.expression || node.function.expression == "") {
        throw new Error(`expression may not be empty`);
    }

    return {
        type: OPERATION_FUNCTION_TYPE,
        expressionMatch: matchExpression(node.function.expression)
    };
};

export const getExpressionMatchesForLoopFunction = (
    node: AbstractNode<VariableNodeType, LoopNodeFunctionState, any>
): LoopFunctionExpressionMatches => {
    if (!node.function.initExpression || node.function.initExpression == "") {
        throw new Error(`expression for initial value may not be empty`);
    }
    if (!node.function.loopExpression || node.function.loopExpression == "") {
        throw new Error(`expression for iteration value may not be empty`);
    }

    return {
        type: LOOP_FUNCTION_TYPE,
        iterationsExpressionMatch: matchExpression(node.function.iterationsExpression),
        initExpressionMatch: matchExpression(node.function.initExpression),
        loopExpressionMatch: matchExpression(node.function.loopExpression)
    };
};

export const getExpressionMatchesForResultFunction = (
    node: AbstractNode<VariableNodeType, ResultNodeFunctionState, any>
): ResultFunctionExpressionMatches => {
    if (!node.function.expression || node.function.expression == "") {
        throw new Error(`expression may not be empty`);
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
        return getExpressionMatchesForOperationFunction(
            node as AbstractNode<VariableNodeType, OperationNodeFunctionState, any>
        );
    } else if (node.function.type == LOOP_FUNCTION_TYPE) {
        return getExpressionMatchesForLoopFunction(node as AbstractNode<VariableNodeType, LoopNodeFunctionState, any>);
    } else if (node.function.type == RESULT_FUNCTION_TYPE) {
        return getExpressionMatchesForResultFunction(
            node as AbstractNode<VariableNodeType, ResultNodeFunctionState, any>
        );
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
    const expressionContext: ExpressionTensorContext = {
        tensorByVariable: {},
        mcRuns: computationContext.mcRuns,
        index: null
    };
    // determine all required variable values as tensors
    for (const variable of getVariableDependencies(node.id)) {
        expressionContext.tensorByVariable[variable] = getTypedTensorForNode(getNodeIdForVariable(variable));
    }

    // evaluate iterations expression
    const iterationsTT = tf.tidy(() => {
        return evaluateExpressionMatch(expressionMatches.iterationsExpressionMatch, expressionContext);
    });

    if (iterationsTT.isProbabilistic || iterationsTT.isSeries || iterationsTT.tensor.shape.length != 0) {
        iterationsTT.tensor.dispose();
        const variableDescription = iterationsTT.isProbabilistic ? "probabilisitc" : "a time series";
        throw new Error(`iterations expression must yield a deterministic value, but was ${variableDescription}`);
    }

    const iterations = iterationsTT.tensor.arraySync() as number;
    iterationsTT.tensor.dispose();

    if (iterations != Math.floor(iterations)) {
        throw new Error(`iterations expression must yield a integer value, but was ${iterations}`);
    }

    // evaluate loop
    return tf.tidy(() => {
        // evaluate init expression
        let tensorList = [] as TypedTensor[];
        const initTensor = evaluateExpressionMatch(expressionMatches.initExpressionMatch, {
            ...expressionContext,
            index: {
                iteration: 0,
                length: iterations
            },
            tensorByVariable: {
                ...expressionContext.tensorByVariable,
                i: getTypedTensorFromConstant(tf.scalar(0))
            }
        });
        tensorList.push(initTensor);

        // evaluate iter expression in loop
        for (let i = 1; i < iterations; i++) {
            const iterTensor = evaluateExpressionMatch(expressionMatches.loopExpressionMatch, {
                ...expressionContext,
                index: {
                    length: iterations,
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
            tensorList = tensorList.map(t => ttToProbabilistic(t, computationContext.mcRuns));
        }

        return {
            tensor: tf.stack(
                tensorList.map(t => t.tensor.toFloat()),
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
