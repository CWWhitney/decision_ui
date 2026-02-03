import { SucceededMatchResult } from "ohm-js";
import { expressionGrammar } from "../grammar";

export const matchExpression = (expression: string) => {
    const match = expressionGrammar.match(expression);

    if (match.failed()) {
        throw Error("expression invalid: " + match.shortMessage);
    }

    return match as SucceededMatchResult;
};
