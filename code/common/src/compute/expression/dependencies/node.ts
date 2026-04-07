import { LOOP_FUNCTION_TYPE, Node, OPERATION_FUNCTION_TYPE, RESULT_FUNCTION_TYPE } from "../../../graph";

export const getVariableDependenciesForNode = (
    node: Node,
    evaluateExpressionForVariableDependencies: (expression: string) => string[]
) => {
    try {
        if (node.function.type == OPERATION_FUNCTION_TYPE || node.function.type == RESULT_FUNCTION_TYPE) {
            return evaluateExpressionForVariableDependencies(node.function.expression);
        } else if (node.function.type == LOOP_FUNCTION_TYPE) {
            return [
                ...evaluateExpressionForVariableDependencies(node.function.iterationsExpression),
                ...evaluateExpressionForVariableDependencies(node.function.initExpression),
                ...evaluateExpressionForVariableDependencies(node.function.loopExpression)
            ].filter(v => v !== "previous" && v !== "i");
        }
        return [];
    } catch {
        return [];
    }
};
