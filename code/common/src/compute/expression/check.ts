import { expressionGrammar } from "./grammar";

export const getExpressionError = (expression: string): string | null => {
    const match = expressionGrammar.match(expression);
    if (match.failed()) {
        return match.shortMessage;
    }
    return null;
};
