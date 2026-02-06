import * as tf from "@tensorflow/tfjs";

import { expressionGrammar } from "../grammar";
import { ExpressionTensorContext } from "./context";
import { netPresentValueExpression } from "./npv";
import { valueVarierExpression } from "./value_varier";
import { chanceEventExpression } from "./chance_event";
import { getCommonSeriesLengthFromTypedTensors, getSeriesLengthFromTypedTensor, TypedTensor } from "../../tensor";
import { SucceededMatchResult } from "ohm-js";
import { ttToProbabilistic, ttToSeries } from "../../math/broadcast";
import {
    assertTensorValue,
    constantTypedTensorValue,
    ExpressionValue,
    nullValue,
    textValue,
    TYPED_TENSOR_VALUE_TYPE,
    typedTensorValue,
    TypedTensorValue
} from "./value";

const wrapUnaryTensorOperator =
    (operator: (t: tf.Tensor) => tf.Tensor) =>
    (t: TypedTensorValue): TypedTensorValue => {
        return {
            ...t,
            type: TYPED_TENSOR_VALUE_TYPE,
            tensor: operator(t.tensor)
        };
    };

const wrapBinaryTensorOperator =
    (operator: (l: tf.Tensor, r: tf.Tensor) => tf.Tensor) =>
    (l: TypedTensor, r: TypedTensor): TypedTensorValue => ({
        type: TYPED_TENSOR_VALUE_TYPE,
        tensor: operator(l.tensor, r.tensor),
        isProbabilistic: l.isProbabilistic || r.isProbabilistic,
        isSeries: l.isSeries || r.isSeries
    });

const UNARY_OPERATORS: { [key: string]: (t: tf.Tensor) => tf.Tensor } = {
    abs: tf.abs,
    ceiling: tf.ceil,
    floor: tf.floor,
    sin: tf.sin,
    cos: tf.cos,
    tan: tf.tan,
    tanh: tf.tanh,
    exp: tf.exp,
    log: tf.log,
    round: tf.round,
    sign: tf.sign
};

const SERIES_FUNCTIONS: { [key: string]: (t: tf.Tensor, axis: number) => tf.Tensor } = {
    sum: tf.sum,
    max: tf.max,
    min: tf.min,
    prod: tf.prod
};

const COMPARISON_OPERATORS: { [key: string]: (l: tf.Tensor, r: tf.Tensor) => tf.Tensor } = {
    "<": tf.less,
    ">": tf.greater,
    "<=": tf.lessEqual,
    ">=": tf.greaterEqual,
    "==": tf.equal,
    "!=": tf.notEqual
};

export const createTensorEvaluationSemantics = () => {
    return expressionGrammar.createSemantics().addOperation<ExpressionValue | ExpressionValue[]>("eval(context)", {
        Exp(e) {
            return e.eval(this.args.context);
        },

        OrExp_or(l, _op, r) {
            return wrapBinaryTensorOperator(tf.logicalOr)(
                assertTensorValue(l.eval(this.args.context), "left side of 'or'"),
                assertTensorValue(r.eval(this.args.context), "right side of 'or'")
            );
        },

        OrExp(e) {
            return e.eval(this.args.context);
        },

        AndExp_and(l, _op, r) {
            return wrapBinaryTensorOperator(tf.logicalAnd)(
                assertTensorValue(l.eval(this.args.context), "left side of 'and' operation"),
                assertTensorValue(r.eval(this.args.context), "right side of 'and' operation")
            );
        },

        AndExp(e) {
            return e.eval(this.args.context);
        },

        NegExp_not(_op, x) {
            return wrapUnaryTensorOperator(tf.logicalNot)(
                assertTensorValue(x.eval(this.args.context), "logical not value")
            );
        },

        NegExp(e) {
            return e.eval(this.args.context);
        },

        RelExp_rel(l, c, r) {
            const operator = c.sourceString;

            if (!(operator in COMPARISON_OPERATORS)) {
                throw new Error(`unknown comparison operator '${operator}'`);
            }

            return wrapBinaryTensorOperator(COMPARISON_OPERATORS[operator])(
                assertTensorValue(l.eval(this.args.context), `left side of '${operator}'`),
                assertTensorValue(r.eval(this.args.context), `right side of '${operator}'`)
            );
        },

        RelExp(e) {
            return e.eval(this.args.context);
        },

        AddExp_plus(a, _op, b) {
            return wrapBinaryTensorOperator(tf.add)(
                assertTensorValue(a.eval(this.args.context), `left side of addition`),
                assertTensorValue(b.eval(this.args.context), `right side of addition`)
            );
        },

        AddExp_minus(a, _op, b) {
            return wrapBinaryTensorOperator(tf.sub)(
                assertTensorValue(a.eval(this.args.context), `left side of subtraction`),
                assertTensorValue(b.eval(this.args.context), `right side of subtraction`)
            );
        },

        AddExp(e) {
            return e.eval(this.args.context);
        },

        MulExp_times(a, _op, b) {
            return wrapBinaryTensorOperator(tf.mul)(
                assertTensorValue(a.eval(this.args.context), `left side of multiplication`),
                assertTensorValue(b.eval(this.args.context), `right side of multiplication`)
            );
        },

        MulExp_divide(a, _op, b) {
            return wrapBinaryTensorOperator(tf.div)(
                assertTensorValue(a.eval(this.args.context), `left side of division`),
                assertTensorValue(b.eval(this.args.context), `right side of division`)
            );
        },

        MulExp_modulo(a, _op, b) {
            return wrapBinaryTensorOperator(tf.mod)(
                assertTensorValue(a.eval(this.args.context), `left side of modulo`),
                assertTensorValue(b.eval(this.args.context), `right side of modulo`)
            );
        },

        MulExp(e) {
            return e.eval(this.args.context);
        },

        UnaryExp_neg(_op, x) {
            return wrapUnaryTensorOperator(tf.neg)(
                assertTensorValue(x.eval(this.args.context), `right side of negation`)
            );
        },

        UnaryExp(e) {
            return e.eval(this.args.context);
        },

        ExpExp_power(a, _op, b) {
            return wrapBinaryTensorOperator(tf.pow)(
                assertTensorValue(a.eval(this.args.context), `base`),
                assertTensorValue(b.eval(this.args.context), `exponent`)
            );
        },

        ExpExp(e) {
            return e.eval(this.args.context);
        },

        PriExp_paren(_l, e, _r) {
            return e.eval(this.args.context);
        },

        IfExp(_if, _lp, condition, _rp, expTrue, _else, expFalse) {
            const context = this.args.context as ExpressionTensorContext;
            let conditionTT = assertTensorValue(condition.eval(this.args.context), "condition");
            let trueTT = assertTensorValue(expTrue.eval(this.args.context), "true branch of if condition");
            let falseTT = assertTensorValue(expFalse.eval(this.args.context), "false branch of if condition");

            if (conditionTT.tensor.dtype !== "bool") {
                throw new Error(`condition value is not of boolean type, but ${conditionTT.tensor.dtype}`);
            }

            if (!conditionTT.isProbabilistic && !conditionTT.isSeries && conditionTT.tensor.shape.length == 0) {
                // this is a simple deterministic if condition
                if (conditionTT.tensor.arraySync()) {
                    return trueTT;
                } else {
                    return falseTT;
                }
            }

            if (conditionTT.isProbabilistic || trueTT.isProbabilistic || falseTT.isProbabilistic) {
                // if anything is probabilistic, make everything probabilisitc
                conditionTT = ttToProbabilistic(conditionTT, context.mcRuns);
                trueTT = ttToProbabilistic(trueTT, context.mcRuns);
                falseTT = ttToProbabilistic(falseTT, context.mcRuns);
            }

            if (conditionTT.iSeries || trueTT.isSeries || falseTT.isSeries) {
                // if anything is series, make everything a series
                const seriesLength = getCommonSeriesLengthFromTypedTensors([conditionTT, trueTT, falseTT]);
                conditionTT = ttToSeries(conditionTT, seriesLength);
                trueTT = ttToSeries(trueTT, seriesLength);
                falseTT = ttToSeries(falseTT, seriesLength);
            }

            return {
                type: TYPED_TENSOR_VALUE_TYPE,
                tensor: tf.add(
                    tf.mul(conditionTT.tensor, trueTT.tensor),
                    tf.mul(tf.sub(1, conditionTT.tensor), falseTT.tensor)
                ),
                isProbabilistic: conditionTT.isProbabilistic,
                isSeries: conditionTT.isSeries
            } as TypedTensorValue;
        },

        FuncExp(nameNode, _l, argListNode, _r) {
            const name = nameNode.sourceString;
            const args = argListNode.eval(this.args.context) as ExpressionValue[];
            const context = this.args.context as ExpressionTensorContext;

            if (name in UNARY_OPERATORS) {
                if (args.length != 1) {
                    throw new Error(`function '${name}' only accepts one parameter`);
                }
                return wrapUnaryTensorOperator(UNARY_OPERATORS[name])(assertTensorValue(args[0], `${name} parameter`));
            }

            if (name in SERIES_FUNCTIONS) {
                if (args.length != 1) {
                    throw new Error(`function '${name}' only accepts one parameter`);
                }
                const tt = assertTensorValue(args[0], `${name} parameter`);
                if (!tt.isSeries) {
                    throw new Error(`function '${name}' can only be applied to time series data`);
                }
                return typedTensorValue({
                    tensor: SERIES_FUNCTIONS[name](tt.tensor, tt.isProbabilistic ? 1 : 0),
                    isSeries: false,
                    isProbabilistic: tt.isProbabilistic
                });
            }

            if (name == "discount") {
                if (args.length < 2 || args.length > 3) {
                    throw new Error(
                        `function 'discount' expects two or three parameters (x, discount_rate, calculate_NPV)`
                    );
                }
                return netPresentValueExpression({
                    mcRuns: context.mcRuns,
                    x: args[0],
                    discountRate: args[1],
                    calculateNpv: args[2] ?? undefined
                });
            }

            if (name == "vv") {
                if (args.length < 3 || args.length > 8) {
                    throw new Error(
                        `function 'vv' expects at least 3 and at most 8 parameters ` +
                            `(var_mean, var_cv, n, distribution, absolute_trend, relative_trend, ` +
                            `lower_limit, upper_limit)`
                    );
                }
                return valueVarierExpression({
                    mcRuns: context.mcRuns,
                    varMean: args[0],
                    varCv: args[1],
                    n: args[2],
                    distribution: args[3],
                    absoluteTrend: args[4],
                    relativeTrend: args[5],
                    lowerLimit: args[6],
                    upperLimit: args[7]
                });
            }

            if (name == "chance_event") {
                if (args.length < 1 || args.length > 7) {
                    throw new Error(
                        `function 'chance_event' expects at least 1 and at most 7 parameter ` +
                            `(chance, value_if, value_if_not, n, cv_if, cv_if_not, one_draw)`
                    );
                }
                return chanceEventExpression({
                    mcRuns: context.mcRuns,
                    chance: args[0],
                    valueIf: args[1],
                    valueIfNot: args[2],
                    n: args[3],
                    cvIf: args[4],
                    cvIfNot: args[5],
                    oneDraw: args[6]
                });
            }

            throw new Error(`function '${name}' not implemented yet`);
        },

        FuncArgs(first, _c, rest) {
            return [first.eval(this.args.context), ...rest.children.map(c => c.eval(this.args.context))];
        },

        pi(_) {
            return constantTypedTensorValue(tf.scalar(Math.PI));
        },

        true(_) {
            return constantTypedTensorValue(tf.scalar(1));
        },

        false(_) {
            return constantTypedTensorValue(tf.scalar(0));
        },

        null(_) {
            return nullValue();
        },

        quotedText(_l, _text, _r) {
            return textValue(_text.sourceString);
        },

        IndexedVariable(variable, sliceOp) {
            const context = this.args.context as ExpressionTensorContext;
            const seriesTT = assertTensorValue(
                variable.eval(this.args.context),
                `indexed variable ${variable.sourceString}`
            );
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
                return typedTensorValue({
                    ...seriesTT,
                    tensor: tf.squeeze(
                        tf.slice2d(seriesTT.tensor as tf.Tensor2D, [0, iteration], [context.mcRuns, 1]),
                        [1]
                    ),
                    isSeries: false
                });
            }

            return typedTensorValue({
                ...seriesTT,
                tensor: tf.squeeze(tf.slice1d(seriesTT.tensor as tf.Tensor1D, iteration, 1), [0]),
                isSeries: false
            });
        },

        variable(_l, _ns) {
            const context = this.args.context as ExpressionTensorContext;
            const variable = this.sourceString;
            if (!(variable in context.tensorByVariable)) {
                throw new Error(`Undefined variable: ${variable}`);
            }
            if (variable == "previous" || variable == "i") {
                return typedTensorValue(context.tensorByVariable[variable]);
            }
            const tt = context.tensorByVariable[variable];
            return typedTensorValue({
                ...tt,
                tensor: tf.keep(tt.tensor).clone()
            });
        },

        number(n) {
            return constantTypedTensorValue(tf.scalar(parseFloat(n.sourceString)));
        }
    });
};

export const getExpressionMatchEvaluator = () => {
    const semantics = createTensorEvaluationSemantics();
    return (match: SucceededMatchResult, context: ExpressionTensorContext) => {
        return assertTensorValue(semantics(match).eval(context), "expression value") as TypedTensor;
    };
};
