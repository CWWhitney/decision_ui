import grammar from "../grammar/expression.ohm-bundle";

export type VariableDependencies = string[];

export const getDepedenciesSemantics = () => {
    return grammar.createSemantics().addOperation<VariableDependencies>("deps()", {
        Exp(e) {
            return e.deps();
        },
        OrExp_or(l, _op, r) {
            return [...l.deps(), ...r.deps()];
        },
        OrExp(e) {
            return e.deps();
        },
        AndExp_and(l, _op, r) {
            return [...l.deps(), ...r.deps()];
        },
        AndExp(e) {
            return e.deps();
        },
        NegExp_not(_op, e) {
            return e.deps();
        },
        NegExp(e) {
            return e.deps();
        },
        RelExp_rel(l, _op, r) {
            return [...l.deps(), ...r.deps()];
        },
        RelExp(e) {
            return e.deps();
        },
        AddExp_plus(l, _op, r) {
            return [...l.deps(), ...r.deps()];
        },
        AddExp_minus(l, _op, r) {
            return [...l.deps(), ...r.deps()];
        },
        AddExp(e) {
            return e.deps();
        },
        MulExp_times(l, _op, r) {
            return [...l.deps(), ...r.deps()];
        },
        MulExp_divide(l, _op, r) {
            return [...l.deps(), ...r.deps()];
        },
        MulExp_modulo(l, _op, r) {
            return [...l.deps(), ...r.deps()];
        },
        MulExp(e) {
            return e.deps();
        },
        UnaryExp_neg(_op, e) {
            return e.deps();
        },
        UnaryExp(e) {
            return e.deps();
        },
        ExpExp_power(b, _op, e) {
            return [...b.deps(), ...e.deps()];
        },
        ExpExp(e) {
            return e.deps();
        },
        PriExp_paren(_lp, e, _rp) {
            return e.deps();
        },
        IfExp(_if, _lp, c, _rp, trueExp, _else, falseExp) {
            return [...c.deps(), ...trueExp.deps(), ...falseExp.deps()];
        },
        FuncExp(_n, _l, argList, _r) {
            return [...argList.deps()];
        },
        FuncArgs(first, _c, rest) {
            return [...first.deps(), ...rest.children.reduce((p, c) => [...p, ...c.deps()], [])];
        },
        pi(_) {
            return [];
        },
        true(_) {
            return [];
        },
        false(_) {
            return [];
        },
        null(_) {
            return [];
        },
        quotedText(_l, _text, _r) {
            return [];
        },
        IndexedVariable(v, _op) {
            return [...v.deps()];
        },
        variable(_l, _ns) {
            return [this.sourceString];
        },
        number_fract(_l, _d, _r) {
            return [];
        },
        number_whole(_chars) {
            return [];
        }
    });
};

export const getExpressionEvaluatorForVariableDependencies = () => {
    const semantics = getDepedenciesSemantics();

    return (expression: string): VariableDependencies => {
        return semantics(grammar.match(expression)).deps();
    };
};
