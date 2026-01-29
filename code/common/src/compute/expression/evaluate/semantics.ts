import * as tf from "@tensorflow/tfjs";

import { expressionGrammar } from "../grammar";
import { ExpressionTensorContext } from "./context";
import { netPresentValue } from "../../math/npv";
import { valueVarier } from "../../math/vv";
import { chanceEvent } from "../../math/chance_event";
import { getTypedTensorFromConstant, TypedTensor } from "../../tensor";

const wrapUnaryTensorOperator = (operator: (t: tf.Tensor) => tf.Tensor) => (t: TypedTensor) => ({
    ...t,
    tensor: operator(t.tensor)
});

const wrapBinaryTensorOperator =
    (operator: (l: tf.Tensor, r: tf.Tensor) => tf.Tensor) =>
    (l: TypedTensor, r: TypedTensor): TypedTensor => ({
        tensor: operator(l.tensor, r.tensor),
        isProbabilistic: l.isProbabilistic || r.isProbabilistic,
        isSeries: l.isSeries || r.isSeries
    });

const unaryOperators: { [key: string]: (t: tf.Tensor) => tf.Tensor } = {
    abs: tf.abs,
    ceiling: tf.ceil,
    floor: tf.floor,
    sin: tf.sin,
    cos: tf.cos,
    tan: tf.tan,
    exp: tf.exp,
    log: tf.log,
    log10: (t: tf.Tensor) => tf.div(tf.log(t), tf.log(10)),
    round: tf.round
};

export const createTensorEvaluationSemantics = () => {
    return expressionGrammar.createSemantics().addOperation<TypedTensor | TypedTensor[]>("eval(context)", {
        Exp(e) {
            return e.eval(this.args.context);
        },

        AddExp_plus(a, _op, b) {
            return wrapBinaryTensorOperator(tf.add)(a.eval(this.args.context), b.eval(this.args.context));
        },

        AddExp_minus(a, _op, b) {
            return wrapBinaryTensorOperator(tf.sub)(a.eval(this.args.context), b.eval(this.args.context));
        },

        AddExp(e) {
            return e.eval(this.args.context);
        },

        MulExp_times(a, _op, b) {
            return wrapBinaryTensorOperator(tf.mul)(a.eval(this.args.context), b.eval(this.args.context));
        },

        MulExp_divide(a, _op, b) {
            return wrapBinaryTensorOperator(tf.div)(a.eval(this.args.context), b.eval(this.args.context));
        },

        MulExp_modulo(a, _op, b) {
            return wrapBinaryTensorOperator(tf.mod)(a.eval(this.args.context), b.eval(this.args.context));
        },

        MulExp(e) {
            return e.eval(this.args.context);
        },

        ExpExp_power(a, _op, b) {
            return wrapBinaryTensorOperator(tf.pow)(a.eval(this.args.context), b.eval(this.args.context));
        },

        ExpExp(e) {
            return e.eval(this.args.context);
        },

        PriExp_paren(_l, e, _r) {
            return e.eval(this.args.context);
        },

        PriExp_neg(_op, e) {
            return tf.neg(e.eval(this.args.context));
        },

        FuncExp(nameNode, _l, argListNode, _r) {
            const name = nameNode.sourceString;
            const args = argListNode.eval(this.args.context) as TypedTensor[];

            if (name in unaryOperators) {
                if (args.length != 1) {
                    throw new Error(`function '${name}' only accepts one parameter`);
                }
                return wrapUnaryTensorOperator(unaryOperators[name])(args[0]);
            }

            if (name == "npv") {
                if (args.length != 2) {
                    throw new Error(`function 'npv' expects two parameters (time series, discount)`);
                }
                return netPresentValue(args[0], args[1]);
            }

            if (name == "vv") {
                if (args.length < 3) {
                    throw new Error(
                        `function 'vv' expects at least 3 parameters ` +
                            `(varMean, varCV, n, absoluteTrend, relativeTrend, lowerLimit, upperLimit)`
                    );
                }
                if (args.length > 7) {
                    throw new Error(
                        `function 'vv' expects at most 7 parameters ` +
                            `(varMean, varCV, n, absoluteTrend, relativeTrend, lowerLimit, upperLimit)`
                    );
                }
                const context = this.args.context as ExpressionTensorContext;
                return valueVarier({
                    mcRuns: context.mcRuns,
                    varMean: args[0],
                    varCv: args[1],
                    n: args[2],
                    distribution: "normal",
                    absoluteTrend: args[3] ?? null,
                    relativeTrend: args[4] ?? null,
                    lowerLimit: args[5] ?? null,
                    upperLimit: args[6] ?? null
                });
            }

            if (name == "chance_event") {
                if (args.length < 1) {
                    throw new Error(
                        `function 'chance_event' expects at least 1 parameter ` +
                            `(chance, valueIf, valueIfNot, n, cvIf, cvIfNot, oneDraw)`
                    );
                }
                const context = this.args.context as ExpressionTensorContext;
                return chanceEvent({
                    mcRuns: context.mcRuns,
                    chance: args[0],
                    valueIf: args[1] ?? null,
                    valueIfNot: args[2] ?? null,
                    n: args[3] ?? null,
                    cvIf: args[4] ?? null,
                    cvIfNot: args[5] ?? null,
                    oneDraw: args[6] ?? null
                });
            }

            throw new Error(`function '${name}' not implemented yet`);
        },

        FuncArgs(first, _c, rest) {
            return [first.eval(this.args.context), ...rest.children.map(c => c.eval(this.args.context))];
        },

        variable(_l, _ns) {
            const context = this.args.context as ExpressionTensorContext;
            const variable = this.sourceString;
            if (!(variable in context.tensorByVariable)) {
                throw new Error(`Undefined variable: ${variable}`);
            }
            if (variable == "previous" || variable == "i") {
                return context.tensorByVariable[variable];
            }
            const tt = context.tensorByVariable[variable];
            return {
                ...tt,
                tensor: tf.keep(tt.tensor).clone()
            } as TypedTensor;
        },

        number(n) {
            return getTypedTensorFromConstant(tf.scalar(parseFloat(n.sourceString)));
        }
    });
};

export const getExpressionEvaluatorForTypedTensor = () => {
    const semantics = createTensorEvaluationSemantics();
    return (expression: string, context: ExpressionTensorContext) => {
        const match = expressionGrammar.match(expression);

        if (match.failed()) {
            throw Error("expression invalid: " + match.shortMessage);
        }

        return semantics(match).eval(context) as TypedTensor;
    };
};
