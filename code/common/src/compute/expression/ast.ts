import grammar from "./expression.ohm-bundle";

export type ExpressionAST =
  | {
      type: "binary";
      operator: "+" | "-" | "*" | "/";
      left: ExpressionAST;
      right: ExpressionAST;
    }
  | { type: "exp"; base: ExpressionAST; exponent: ExpressionAST }
  | { type: "number"; value: number }
  | { type: "variable"; identifier: string };

export const getExpressionAstSemantics = () => {
  return grammar.createSemantics().addOperation<ExpressionAST>("ast()", {
    Exp(e) {
      return e.ast();
    },
    AddExp(e) {
      return e.ast();
    },
    AddExp_plus(left, operator, right) {
      return {
        type: "binary",
        operator: "+",
        left: left.ast(),
        right: right.ast(),
      };
    },
    AddExp_minus(left, operator, right) {
      return {
        type: "binary",
        operator: "-",
        left: left.ast(),
        right: right.ast(),
      };
    },
    MulExp(e) {
      return e.ast();
    },
    MulExp_times(left, operator, right) {
      return {
        type: "binary",
        operator: "*",
        left: left.ast(),
        right: right.ast(),
      };
    },
    MulExp_divide(left, operator, right) {
      return {
        type: "binary",
        operator: "/",
        left: left.ast(),
        right: right.ast(),
      };
    },
    ExpExp(e) {
      return e.ast();
    },
    ExpExp_power(base, operator, exponent) {
      return {
        type: "exp",
        base: base.ast(),
        exponent: exponent.ast(),
      };
    },
    PriExp(e) {
      return e.ast();
    },
    PriExp_paren(open, exp, _close) {
      return exp.ast();
    },
    PriExp_pos(operator, right) {
      return {
        type: "binary",
        operator: "*",
        left: { type: "number", value: 1 },
        right: right.ast(),
      };
    },
    PriExp_neg(operator, right) {
      return {
        type: "binary",
        operator: "*",
        left: { type: "number", value: -1 },
        right: right.ast(),
      };
    },
    ident(_l, _ns) {
      return { type: "variable", identifier: this.sourceString };
    },
    number_fract(_l, _d, _r) {
      return { type: "number", value: parseFloat(this.sourceString) };
    },
    number_whole(_chars) {
      return { type: "number", value: parseInt(this.sourceString, 10) };
    },
  });
};

export const generateArithmeticAstParser = () => {
  const semantics = getExpressionAstSemantics();

  return (expression: string): ExpressionAST => {
    return semantics(grammar.match(expression)).ast();
  };
};
