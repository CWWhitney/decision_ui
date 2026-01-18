import * as tf from "@tensorflow/tfjs";

import grammar from "./expression.ohm-bundle";
import {
    ComputationValue,
    DETERMINISTIC_COMPUTATION_VALUE_TYPE,
    PROBABILISTIC_COMPUTATION_VALUE_TYPE,
    SERIES_COMPUTATION_VALUE_TYPE
} from "../result";
import { VariableDependencies } from "./dependencies";
import { ESTIMATE_NODE_TYPE, Node, NodeId, OPERATION_NODE_TYPE } from "../../graph";
import { getNormalDistributionParameter } from "../math";
import { ComputationContext } from "../context";
import { getTruncNormalDistributionSample } from "../math/distributions/trunc_normal";

export interface ExpressionTensorContext {
    tensorByVariable: { [variable: string]: tf.Tensor };
}

tf.ready().then(() => {
    console.log(`tensorflow is ready with backend '${tf.getBackend()}'`);
});

export async function tensorToComputationValue(tensor: tf.Tensor): Promise<ComputationValue> {
    const data = await tensor.array();
    const shape = tensor.shape;

    switch (shape.length) {
        case 0:
            return {
                type: DETERMINISTIC_COMPUTATION_VALUE_TYPE,
                data: data as number,
                shape: []
            };
        case 1:
            return {
                type: PROBABILISTIC_COMPUTATION_VALUE_TYPE,
                data: data as number[],
                shape: shape as [number]
            };
        case 2: {
            return {
                type: SERIES_COMPUTATION_VALUE_TYPE,
                data: data as number[][],
                shape: shape as [number, number]
            };
        }
        default:
            throw new Error(`Unsupported tensor shape: ${JSON.stringify(shape)}`);
    }
}

export const createTensorEvaluationSemantics = () => {
    return grammar.createSemantics().addOperation<tf.Tensor>("eval(context)", {
        Exp(e) {
            return e.eval(this.args.context);
        },

        AddExp_plus(a, _op, b) {
            return tf.add(a.eval(this.args.context), b.eval(this.args.context));
        },

        AddExp_minus(a, _op, b) {
            return tf.sub(a.eval(this.args.context), b.eval(this.args.context));
        },

        AddExp(e) {
            return e.eval(this.args.context);
        },

        MulExp_times(a, _op, b) {
            return tf.mul(a.eval(this.args.context), b.eval(this.args.context));
        },

        MulExp_divide(a, _op, b) {
            return tf.div(a.eval(this.args.context), b.eval(this.args.context));
        },

        MulExp(e) {
            return e.eval(this.args.context);
        },

        ExpExp_power(a, _op, b) {
            return tf.pow(a.eval(this.args.context), b.eval(this.args.context));
        },

        ExpExp(e) {
            return e.eval(this.args.context);
        },

        PriExp_paren(_l, e, _r) {
            return e.eval(this.args.context);
        },

        PriExp_pos(_op, e) {
            return e.eval(this.args.context);
        },

        PriExp_neg(_op, e) {
            return tf.neg(e.eval(this.args.context));
        },

        ident(_l, _ns) {
            const context = this.args.context as ExpressionTensorContext;
            const variable = this.sourceString;
            if (!(variable in context.tensorByVariable)) {
                throw new Error(`Undefined variable: ${variable}`);
            }
            return tf.keep(context.tensorByVariable[variable]);
        },

        number(n) {
            return tf.scalar(parseFloat(n.sourceString));
        }
    });
};

export const getExpressionEvaluatorForTensor = () => {
    const semantics = createTensorEvaluationSemantics();
    return (expression: string, context: ExpressionTensorContext) => {
        const match = grammar.match(expression);

        if (match.failed()) {
            throw Error("expression invalid: " + match.shortMessage);
        }

        return semantics(match).eval(context) as tf.Tensor;
    };
};

export type ComputedTensor =
    | {
          type: "success";
          value: tf.Tensor;
      }
    | {
          type: "error";
          message: string;
      };

export const getTensorForEstimateNode = (node: Node, context: ComputationContext): tf.Tensor => {
    if (node.type != ESTIMATE_NODE_TYPE) {
        throw new Error(`cannot calculate estimate node tensor for node of type '${node.type}'`);
    }

    if (node.options.distribution == "deterministic") {
        return tf.scalar(node.options.lower);
    } else if (node.options.distribution == "norm") {
        const { mean, stddev } = getNormalDistributionParameter(node.options.lower, node.options.upper);
        return tf.randomNormal([context.mcRuns], mean, stddev);
    } else if (node.options.distribution == "posnorm") {
        return tf.tensor1d(getTruncNormalDistributionSample(node.options.lower, node.options.upper, context.mcRuns));
    }

    throw new Error(`distribution '${node.options.distribution}' tensor calculation not implemented`);
};

export const getTensorForOperationNode = (
    node: Node,
    getVariableDependencies: (nodeId: string) => VariableDependencies,
    getNodeIdForVariable: (variable: string) => NodeId,
    evaluateExpressionForTensor: (expression: string, expressionContext: ExpressionTensorContext) => tf.Tensor,
    getTensorForNode: (nodeId: string) => tf.Tensor
): tf.Tensor => {
    if (node.type != OPERATION_NODE_TYPE) {
        throw new Error(`cannot calculate operation node tensor for node of type '${node.type}'`);
    }

    // determine all required variable values as tensors
    const expressionContext: ExpressionTensorContext = { tensorByVariable: {} };
    for (const variable of getVariableDependencies(node.id)) {
        expressionContext.tensorByVariable[variable] = getTensorForNode(getNodeIdForVariable(variable));
    }

    return tf.tidy(() => evaluateExpressionForTensor(node.options.expression, expressionContext));
};

export const getTensorForNodeRecursion = (
    nodeId: string,
    getNode: (nodeId: string) => Node,
    getVariableDependencies: (nodeId: string) => VariableDependencies,
    getNodeIdForVariable: (variable: string) => NodeId,
    evaluateExpressionForTensor: (expression: string, expressionContext: ExpressionTensorContext) => tf.Tensor,
    getTensorForNode: (nodeId: string) => tf.Tensor,
    computationContext: ComputationContext
): tf.Tensor => {
    const node = getNode(nodeId);
    if (node.type == ESTIMATE_NODE_TYPE) {
        return getTensorForEstimateNode(node, computationContext);
    } else if (node.type == OPERATION_NODE_TYPE) {
        return getTensorForOperationNode(
            node,
            getVariableDependencies,
            getNodeIdForVariable,
            evaluateExpressionForTensor,
            getTensorForNode
        );
    }
    throw new Error(`unknown node type ${node.type}`);
};

export const getComputationValueForNode = async (
    nodeId: string,
    getTensorForNode: (nodeId: string) => tf.Tensor
): Promise<ComputationValue> => {
    const tensor = getTensorForNode(nodeId);
    const value = await tensorToComputationValue(tensor);
    return value;
};
