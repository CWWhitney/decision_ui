import grammar from "../grammar/expression.ohm-bundle";

export type VariableDependencies = string[];

export const getDepedenciesSemantics = () => {
    return grammar.createSemantics().addOperation<VariableDependencies>("deps()", {
        Exp(e) {
            return e.deps();
        },
        AddExp(e) {
            return e.deps();
        },
        AddExp_plus(left, operator, right) {
            return [...left.deps(), ...right.deps()];
        },
        AddExp_minus(left, operator, right) {
            return [...left.deps(), ...right.deps()];
        },
        MulExp(e) {
            return e.deps();
        },
        MulExp_times(left, operator, right) {
            return [...left.deps(), ...right.deps()];
        },
        MulExp_divide(left, operator, right) {
            return [...left.deps(), ...right.deps()];
        },
        MulExp_modulo(left, operator, right) {
            return [...left.deps(), ...right.deps()];
        },
        ExpExp(e) {
            return e.deps();
        },
        ExpExp_power(base, operator, exponent) {
            return [...base.deps(), ...exponent.deps()];
        },
        PriExp(e) {
            return e.deps();
        },
        PriExp_paren(open, exp, _close) {
            return exp.deps();
        },
        PriExp_neg(operator, right) {
            return [...right.deps()];
        },
        FuncExp(_n, _l, argList, _r) {
            return [...argList.deps()];
        },
        FuncArgs(first, _c, rest) {
            return [...first.deps(), ...rest.children.reduce((p, c) => [...p, ...c.deps()], [])];
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
