import * as tf from "@tensorflow/tfjs";

import { expressionGrammar } from "../grammar";
import { ExpressionTensorContext } from "./context";
import { netPresentValue } from "../../math/npv";
import { valueVarier } from "../../math/vv";
import { chanceEvent } from "../../math/chance_event";
import { getSeriesLengthFromTypedTensor, getTypedTensorFromConstant, TypedTensor } from "../../tensor";

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

        OrExp_or(l, _op, r) {
            return wrapBinaryTensorOperator(tf.logicalOr)(l.eval(this.args.context), r.eval(this.args.context));
        },

        OrExp(e) {
            return e.eval(this.args.context);
        },

        AndExp_and(l, _op, r) {
            return wrapBinaryTensorOperator(tf.logicalAnd)(l.eval(this.args.context), r.eval(this.args.context));
        },

        AndExp(e) {
            return e.eval(this.args.context);
        },

        NegExp_not(_op, x) {
            return wrapUnaryTensorOperator(tf.logicalNot)(x.eval(this.args.context));
        },

        NegExp(e) {
            return e.eval(this.args.context);
        },

        RelExp_rel(l, c, r) {
            switch (c.sourceString) {
                case "<":
                    return wrapBinaryTensorOperator(tf.less)(l.eval(this.args.context), r.eval(this.args.context));
                case ">":
                    return wrapBinaryTensorOperator(tf.greater)(l.eval(this.args.context), r.eval(this.args.context));
                case "<=":
                    return wrapBinaryTensorOperator(tf.lessEqual)(l.eval(this.args.context), r.eval(this.args.context));
                case ">=":
                    return wrapBinaryTensorOperator(tf.greaterEqual)(
                        l.eval(this.args.context),
                        r.eval(this.args.context)
                    );
                case "==":
                    return wrapBinaryTensorOperator(tf.equal)(l.eval(this.args.context), r.eval(this.args.context));
                case "!=":
                    return wrapBinaryTensorOperator(tf.notEqual)(l.eval(this.args.context), r.eval(this.args.context));
            }
            throw new Error(`unknown comparison operator '${c.sourceString}'`);
        },

        RelExp(e) {
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

        UnaryExp_neg(_op, x) {
            return wrapUnaryTensorOperator(tf.neg)(x.eval(this.args.context));
        },

        UnaryExp(e) {
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

        IfExp(_if, _lp, condition, _rp, expTrue, _else, expFalse) {
            const conditionTT = condition.eval(this.args.context) as TypedTensor;
            const trueTT = expTrue.eval(this.args.context) as TypedTensor;
            const falseTT = expFalse.eval(this.args.context) as TypedTensor;

            if (conditionTT.tensor.dtype !== "bool") {
                throw new Error(`condition value is not of boolean type, but ${conditionTT.tensor.dtype}`);
            }

            if (
                conditionTT.isProbabilistic != trueTT.isProbabilistic ||
                conditionTT.isProbabilistic != falseTT.isProbabilistic
            ) {
                throw new Error(
                    `condition value, true value and false value need to be all probabilistic or all not probabilistic`
                );
            }

            if (conditionTT.isSeries != trueTT.isSeries || conditionTT.isSeries != falseTT.isSeries) {
                throw new Error(
                    `condition value, true value and false value need to be all a series or all not a series`
                );
            }

            if (
                !tf.util.arraysEqual(conditionTT.tensor.shape, trueTT.tensor.shape) ||
                !tf.util.arraysEqual(conditionTT.tensor.shape, falseTT.tensor.shape)
            ) {
                throw new Error(
                    `condition value shape, true value shape and false value shape need to match, ` +
                        `but are ${JSON.stringify(conditionTT.tensor.shape)} (condition), ` +
                        `${JSON.stringify(trueTT.tensor.shape)} (true value) and ` +
                        `${JSON.stringify(falseTT.tensor.shape)} (false value)`
                );
            }

            return {
                tensor: tf.add(
                    tf.mul(conditionTT.tensor, trueTT.tensor),
                    tf.mul(tf.sub(1, conditionTT.tensor), falseTT.tensor)
                ),
                isProbabilistic: conditionTT.isProbabilistic,
                isSeries: conditionTT.isSeries
            } as TypedTensor;
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

        IndexedVariable(variable, sliceOp) {
            const context = this.args.context as ExpressionTensorContext;
            const seriesTT = variable.eval(this.args.context) as TypedTensor;
            const slice = sliceOp.sourceString;

            if (!context.index) {
                throw Error("cannot apply index to value outside of loop context");
            }

            if (!seriesTT.isSeries) {
                throw Error("cannot apply index to value which is not a series");
            }

            const seriesLength = getSeriesLengthFromTypedTensor(seriesTT);

            if (context.index.length != seriesLength) {
                throw Error(
                    `cannot apply index to series of different length (${seriesLength}) ` +
                        `than current loop context ${context.index.length}`
                );
            }

            const iteration = slice == "[i]" ? context.index.iteration : context.index.iteration - 1;

            if (iteration < 0) {
                throw Error(`cannot apply index [i-1] within the initial expression`);
            }

            if (seriesTT.isProbabilistic) {
                return {
                    ...seriesTT,
                    tensor: tf.squeeze(
                        tf.slice2d(seriesTT.tensor as tf.Tensor2D, [0, iteration], [context.mcRuns, 1]),
                        [1]
                    ),
                    isSeries: false
                };
            }

            return {
                ...seriesTT,
                tensor: tf.squeeze(tf.slice1d(seriesTT.tensor as tf.Tensor1D, iteration, 1), [0]),
                isSeries: false
            };
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
