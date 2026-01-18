import grammar from "./expression.ohm-bundle.js";

export const getExpressionError = (expression: string): string | null => {
  const match = grammar.match(expression);
  if (match.failed()) {
    return match.shortMessage;
  }
  return null;
};
