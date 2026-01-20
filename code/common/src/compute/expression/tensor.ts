import {
    getBackend,
    ready as tensorflowReady,
    ENV as tensorflowENV,
    type Tensor,
    add,
    sub,
    mul,
    div,
    pow,
    neg,
    keep,
    scalar,
    randomNormal,
    tensor1d,
    tidy,
    stack
} from "@tensorflow/tfjs";

import grammar from "./expression.ohm-bundle";

import { VariableDependencies } from "./dependencies";
import {
    ESTIMATE_NODE_TYPE,
    LOOP_NODE_TYPE,
    LOOP_OPERATION_NODE_TYPE,
    Node,
    NodeId,
    OPERATION_NODE_TYPE,
    RESULT_NODE_TYPE
} from "../../graph";
import { getNormalDistributionParameter, validateLowerUpperBounds } from "../math";
import { ComputationContext } from "../context";
import {
    get01TruncatedNormalDistributionSample,
    getPositiveNormalDistributionSample,
    validate01TruncatedNormalDistributionParameters,
    validatePositiveNormalDistributionParameters
} from "../math/distributions/trunc_normal";
import { DETERMINISTIC_TYPE, PROBABILISTIC_TYPE, SERIES_TYPE } from "../value";
import { TensorDescriptor } from "../tensor";

export interface ExpressionTensorContext {
    tensorByVariable: { [variable: string]: Tensor };
}

tensorflowReady().then(() => {
    const backend = getBackend();
    const float32support = tensorflowENV.getBool("WEBGL_RENDER_FLOAT32_CAPABLE");
    const float32enabled = tensorflowENV.getBool("WEBGL_RENDER_FLOAT32_ENABLED");
    console.log(`tensorflow is ready with backend '${backend}' (float32 = ${float32support && float32enabled})`);
});

export const tensorToDescriptor = (tensor: Tensor): TensorDescriptor => {
    const shape = tensor.shape;
    const dtype = `${tensor.dtype}`;

    switch (shape.length) {
        case 0:
            return {
                type: DETERMINISTIC_TYPE,
                shape: [],
                dtype
            };
        case 1:
            return {
                type: PROBABILISTIC_TYPE,
                shape: shape as [number],
                dtype
            };
        case 2: {
            return {
                type: SERIES_TYPE,
                shape: shape as [number, number],
                dtype
            };
        }
        default:
            throw new Error(`unsupported tensor shape: ${JSON.stringify(shape)}`);
    }
};

export const createTensorEvaluationSemantics = () => {
    return grammar.createSemantics().addOperation<Tensor>("eval(context)", {
        Exp(e) {
            return e.eval(this.args.context);
        },

        AddExp_plus(a, _op, b) {
            return add(a.eval(this.args.context), b.eval(this.args.context));
        },

        AddExp_minus(a, _op, b) {
            return sub(a.eval(this.args.context), b.eval(this.args.context));
        },

        AddExp(e) {
            return e.eval(this.args.context);
        },

        MulExp_times(a, _op, b) {
            return mul(a.eval(this.args.context), b.eval(this.args.context));
        },

        MulExp_divide(a, _op, b) {
            return div(a.eval(this.args.context), b.eval(this.args.context));
        },

        MulExp(e) {
            return e.eval(this.args.context);
        },

        ExpExp_power(a, _op, b) {
            return pow(a.eval(this.args.context), b.eval(this.args.context));
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
            return neg(e.eval(this.args.context));
        },

        ident(_l, _ns) {
            const context = this.args.context as ExpressionTensorContext;
            const variable = this.sourceString;
            if (!(variable in context.tensorByVariable)) {
                throw new Error(`Undefined variable: ${variable}`);
            }
            if (variable == "previous" || variable == "i") {
                return context.tensorByVariable[variable];
            }
            return keep(context.tensorByVariable[variable]).clone();
        },

        number(n) {
            return scalar(parseFloat(n.sourceString));
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

        return semantics(match).eval(context) as Tensor;
    };
};

export type ComputedTensor =
    | {
          type: "success";
          value: Tensor;
      }
    | {
          type: "error";
          message: string;
      };

export const getTensorForEstimateNode = (node: Node, context: ComputationContext): Tensor => {
    if (node.type != ESTIMATE_NODE_TYPE) {
        throw new Error(`cannot calculate estimate node tensor for node of type '${node.type}'`);
    }

    if (node.options.distribution == "deterministic") {
        return scalar(node.options.lower);
    } else if (node.options.distribution == "norm") {
        validateLowerUpperBounds(node.options.lower, node.options.upper);
        const { mean, stddev } = getNormalDistributionParameter(node.options.lower, node.options.upper);
        return randomNormal([context.mcRuns], mean, stddev);
    } else if (node.options.distribution == "posnorm") {
        validatePositiveNormalDistributionParameters(node.options.lower, node.options.upper);
        return tensor1d(getPositiveNormalDistributionSample(node.options.lower, node.options.upper, context.mcRuns));
    } else if (node.options.distribution == "tnorm_0_1") {
        validate01TruncatedNormalDistributionParameters(node.options.lower, node.options.upper);
        return tensor1d(get01TruncatedNormalDistributionSample(node.options.lower, node.options.upper, context.mcRuns));
    }

    throw new Error(`distribution '${node.options.distribution}' tensor calculation not implemented`);
};

export const getTensorForNodeWithExpression = (
    node: Node,
    getVariableDependencies: (nodeId: string) => VariableDependencies,
    getNodeIdForVariable: (variable: string) => NodeId,
    evaluateExpressionForTensor: (expression: string, expressionContext: ExpressionTensorContext) => Tensor,
    getTensorForNode: (nodeId: string) => Tensor
): Tensor => {
    if (!(node.type == OPERATION_NODE_TYPE || node.type == RESULT_NODE_TYPE)) {
        throw new Error(`cannot calculate operation node tensor for node of type '${node.type}'`);
    }

    // determine all required variable values as tensors
    const expressionContext: ExpressionTensorContext = { tensorByVariable: {} };
    for (const variable of getVariableDependencies(node.id)) {
        expressionContext.tensorByVariable[variable] = getTensorForNode(getNodeIdForVariable(variable));
    }

    return tidy(() => evaluateExpressionForTensor(node.options.expression, expressionContext));
};

export const getTensorForLoopOperationNode = (
    node: Node,
    getNode: (nodeId: string) => Node,
    getVariableDependencies: (nodeId: string) => VariableDependencies,
    getNodeIdForVariable: (variable: string) => NodeId,
    evaluateExpressionForTensor: (expression: string, expressionContext: ExpressionTensorContext) => Tensor,
    getTensorForNode: (nodeId: string) => Tensor
): Tensor => {
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
    const expressionContext: ExpressionTensorContext = { tensorByVariable: {} };
    for (const variable of getVariableDependencies(node.id)) {
        expressionContext.tensorByVariable[variable] = getTensorForNode(getNodeIdForVariable(variable));
    }

    const stacked = tidy(() => {
        const tensorList = [] as Tensor[];
        const initTensor = tidy(() => evaluateExpressionForTensor(node.options.initExpression, expressionContext));
        tensorList.push(initTensor);
        for (let i = 1; i < parentNode.options.iterations; i++) {
            const iterTensor = evaluateExpressionForTensor(node.options.iterExpression, {
                tensorByVariable: {
                    ...expressionContext.tensorByVariable,
                    i: scalar(i),
                    previous: tensorList[i - 1]
                }
            });
            tensorList.push(iterTensor);
        }
        return stack(tensorList, -1);
    });
    return stacked;
};

export const getTensorForNodeRecursion = (
    nodeId: string,
    getNode: (nodeId: string) => Node,
    getVariableDependencies: (nodeId: string) => VariableDependencies,
    getNodeIdForVariable: (variable: string) => NodeId,
    evaluateExpressionForTensor: (expression: string, expressionContext: ExpressionTensorContext) => Tensor,
    getTensorForNode: (nodeId: string) => Tensor,
    computationContext: ComputationContext
): Tensor => {
    const node = getNode(nodeId);
    if (node.type == ESTIMATE_NODE_TYPE) {
        return getTensorForEstimateNode(node, computationContext);
    } else if (node.type == OPERATION_NODE_TYPE || node.type == RESULT_NODE_TYPE) {
        return getTensorForNodeWithExpression(
            node,
            getVariableDependencies,
            getNodeIdForVariable,
            evaluateExpressionForTensor,
            getTensorForNode
        );
    } else if (node.type == LOOP_OPERATION_NODE_TYPE) {
        return getTensorForLoopOperationNode(
            node,
            getNode,
            getVariableDependencies,
            getNodeIdForVariable,
            evaluateExpressionForTensor,
            getTensorForNode
        );
    }
    throw new Error(`unknown node type ${node.type}`);
};
