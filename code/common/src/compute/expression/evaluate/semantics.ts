import { type Tensor, add, sub, mul, div, pow, neg, keep, scalar } from "@tensorflow/tfjs";

import { expressionGrammar } from "../grammar";
import { ExpressionTensorContext } from "./context";

export const createTensorEvaluationSemantics = () => {
    return expressionGrammar.createSemantics().addOperation<Tensor>("eval(context)", {
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
        const match = expressionGrammar.match(expression);

        if (match.failed()) {
            throw Error("expression invalid: " + match.shortMessage);
        }

        return semantics(match).eval(context) as Tensor;
    };
};
