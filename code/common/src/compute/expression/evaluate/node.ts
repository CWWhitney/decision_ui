import * as tf from "@tensorflow/tfjs";

import { VariableDependencies } from "../dependencies/semantics";
import {
    ESTIMATE_NODE_TYPE,
    LOOP_NODE_TYPE,
    LOOP_OPERATION_NODE_TYPE,
    Node,
    NodeId,
    OPERATION_NODE_TYPE,
    RESULT_NODE_TYPE
} from "../../../graph";
import { getNormalDistributionParameter, validateLowerUpperBounds } from "../../math";
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
    if (node.type != ESTIMATE_NODE_TYPE) {
        throw new Error(`cannot calculate estimate node tensor for node of type '${node.type}'`);
    }

    if (node.options.distribution == "deterministic") {
        return getTypedTensorFromConstant(tf.scalar(node.options.lower));
    } else if (node.options.distribution == "norm") {
        validateLowerUpperBounds(node.options.lower, node.options.upper);
        const { mean, stddev } = getNormalDistributionParameter(node.options.lower, node.options.upper);
        return {
            tensor: tf.randomNormal([context.mcRuns], mean, stddev),
            isProbabilistic: true,
            isSeries: false
        };
    } else if (node.options.distribution == "posnorm") {
        validatePositiveNormalDistributionParameters(node.options.lower, node.options.upper);
        return {
            tensor: tf.tensor1d(
                getPositiveNormalDistributionSample(node.options.lower, node.options.upper, context.mcRuns)
            ),
            isProbabilistic: true,
            isSeries: false
        };
    } else if (node.options.distribution == "tnorm_0_1") {
        validate01TruncatedNormalDistributionParameters(node.options.lower, node.options.upper);
        return {
            tensor: tf.tensor1d(
                get01TruncatedNormalDistributionSample(node.options.lower, node.options.upper, context.mcRuns)
            ),
            isProbabilistic: true,
            isSeries: false
        };
    }

    throw new Error(`distribution '${node.options.distribution}' tensor calculation not implemented`);
};

export const getTypedTensorForNodeWithExpression = (
    node: Node,
    getVariableDependencies: (nodeId: string) => VariableDependencies,
    getNodeIdForVariable: (variable: string) => NodeId,
    evaluateExpressionForTensor: (expression: string, expressionContext: ExpressionTensorContext) => TypedTensor,
    getTypedTensorForNode: (nodeId: string) => TypedTensor,
    computationContext: ComputationContext
): TypedTensor => {
    if (!(node.type == OPERATION_NODE_TYPE || node.type == RESULT_NODE_TYPE)) {
        throw new Error(`cannot calculate operation node tensor for node of type '${node.type}'`);
    }

    // determine all required variable values as tensors
    const expressionContext: ExpressionTensorContext = { tensorByVariable: {}, mcRuns: computationContext.mcRuns };
    for (const variable of getVariableDependencies(node.id)) {
        expressionContext.tensorByVariable[variable] = getTypedTensorForNode(getNodeIdForVariable(variable));
    }

    return tf.tidy(() => evaluateExpressionForTensor(node.options.expression, expressionContext));
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
    if (node.type != LOOP_OPERATION_NODE_TYPE) {
        throw new Error(`cannot calculate loop operation node tensor for node of type '${node.type}'`);
    }

    if (!node.parentNodeId) {
        throw new Error(`cannot calculate loop operation node without a parent node`);
    }

    const parentNode = getNode(node.parentNodeId);
    if (parentNode.type != LOOP_NODE_TYPE) {
        throw new Error(`cannot calculate loop operation node if parent node is not of type '${LOOP_NODE_TYPE}}`);
    }

    // determine all required variable values as tensors
    const expressionContext: ExpressionTensorContext = { tensorByVariable: {}, mcRuns: computationContext.mcRuns };
    for (const variable of getVariableDependencies(node.id)) {
        expressionContext.tensorByVariable[variable] = getTypedTensorForNode(getNodeIdForVariable(variable));
    }

    return tf.tidy(() => {
        const tensorList = [] as TypedTensor[];
        const initTensor = evaluateExpressionForTensor(node.options.initExpression, expressionContext);
        tensorList.push(initTensor);
        for (let i = 1; i < parentNode.options.iterations; i++) {
            const iterTensor = evaluateExpressionForTensor(node.options.iterExpression, {
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
    if (node.type == ESTIMATE_NODE_TYPE) {
        return getTypedTensorForEstimateNode(node, computationContext);
    } else if (node.type == OPERATION_NODE_TYPE || node.type == RESULT_NODE_TYPE) {
        return getTypedTensorForNodeWithExpression(
            node,
            getVariableDependencies,
            getNodeIdForVariable,
            evaluateExpressionForTensor,
            getTypedTensorForNode,
            computationContext
        );
    } else if (node.type == LOOP_OPERATION_NODE_TYPE) {
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
