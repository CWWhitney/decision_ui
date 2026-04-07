import { expressionGrammar } from "../grammar";

import grammar from "../grammar/expression.ohm-bundle";

export const createRCodeSemantics = () => {
    return expressionGrammar.createSemantics().addOperation<string | string[]>("code()", {
        Exp(e) {
            return e.code();
        },

        OrExp_or(l, _op, r) {
            return `${l.code()} | ${r.code()}`;
        },

        OrExp(e) {
            return e.code();
        },

        AndExp_and(l, _op, r) {
            return `${l.code()} & ${r.code()}`;
        },

        AndExp(e) {
            return e.code();
        },

        NegExp_not(_op, x) {
            return `!${x.code()}`;
        },

        NegExp(e) {
            return e.code();
        },

        RelExp_rel(l, c, r) {
            const operator = c.sourceString;
            return `${l.code()} ${operator} ${r.code()}`;
        },

        RelExp(e) {
            return e.code();
        },

        AddExp_plus(a, _op, b) {
            return `${a.code()} + ${b.code()}`;
        },

        AddExp_minus(a, _op, b) {
            return `${a.code()} - ${b.code()}`;
        },

        AddExp(e) {
            return e.code();
        },

        MulExp_times(a, _op, b) {
            return `${a.code()} * ${b.code()}`;
        },

        MulExp_divide(a, _op, b) {
            return `${a.code()} / ${b.code()}`;
        },

        MulExp_modulo(a, _op, b) {
            return `${a.code()} %% ${b.code()}`;
        },

        MulExp(e) {
            return e.code();
        },

        UnaryExp_neg(_op, x) {
            return `-${x.code()}`;
        },

        UnaryExp(e) {
            return e.code();
        },

        ExpExp_power(a, _op, b) {
            return `${a.code()}^${b.code()}`;
        },

        ExpExp(e) {
            return e.code();
        },

        PriExp_paren(_l, e, _r) {
            return `(${e.code()})`;
        },

        IfExp(_if, _lp, condition, _rp, expTrue, _else, expFalse) {
            return `if (${condition.code()}) ` + `${expTrue.code()} else ` + `${expFalse.code()}`;
        },

        FuncExp(nameNode, _l, argListNode, _r) {
            const name = nameNode.sourceString;
            const args = argListNode.code() as string[];
            return `${name}(${args.join(", ")})`;
        },

        FuncArgs(first, _c, rest) {
            return [first.code(), ...rest.children.map(c => c.code())];
        },

        pi(_) {
            return `pi`;
        },

        true(_) {
            return `TRUE`;
        },

        false(_) {
            return `FALSE`;
        },

        null(_) {
            return `NA`;
        },

        quotedText(_l, _text, _r) {
            return `"${_text.sourceString}"`;
        },

        IndexedVariable(variable, sliceOp) {
            return `${variable.sourceString}${sliceOp.sourceString}`;
        },

        variable(_l, _ns) {
            return `${this.sourceString}`;
        },

        number(_n) {
            return `${this.sourceString}`;
        }
    });
};

export const getExpressionRCodeGenerator = () => {
    const semantics = createRCodeSemantics();

    return (expression: string): string => {
        return semantics(grammar.match(expression)).code();
    };
};
