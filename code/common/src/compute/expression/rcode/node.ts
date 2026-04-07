import {
    ESTIMATE_FUNCTION_TYPE,
    LOOP_FUNCTION_TYPE,
    Node,
    NodeId,
    OPERATION_FUNCTION_TYPE,
    RESULT_FUNCTION_TYPE,
    VARIABLE_NODE_TYPE,
    VariableNode
} from "../../../graph";
import { VariableDependencies } from "../dependencies";
import { R_CODE_LINE_BREAK, RCodeFragment } from "./base";

export const combineRCodeFragments = (fragment1: RCodeFragment, fragment2: RCodeFragment): RCodeFragment => {
    return {
        definedVariables: [...new Set([...fragment1.definedVariables, ...fragment2.definedVariables])],
        code:
            fragment1.code && fragment2.code
                ? `${fragment1.code}${R_CODE_LINE_BREAK}${R_CODE_LINE_BREAK}${fragment2.code}`
                : fragment1.code
                  ? fragment1.code
                  : fragment2.code
    };
};

export const getCombinedRCodeFragmentForVariableDependencies = (
    nodes: VariableNode[],
    existingVariables: string[],
    getRCodeFragmentForNode: (nodeId: string, existingVariables: string[]) => RCodeFragment
): RCodeFragment => {
    let combinedFragment: RCodeFragment = {
        definedVariables: existingVariables,
        code: null
    };
    for (const node of nodes) {
        if (!combinedFragment.definedVariables.includes(node.function.variable)) {
            combinedFragment = combineRCodeFragments(
                combinedFragment,
                getRCodeFragmentForNode(node.id, combinedFragment.definedVariables)
            );
        }
    }
    return combinedFragment;
};

export const getRCodeFragmentForNodeRecursion = (
    nodeId: NodeId,
    existingVariables: string[],
    getNode: (nodeId: string) => Node,
    getVariableDependencies: (nodeId: string) => VariableDependencies,
    getNodeIdForVariable: (variable: string) => NodeId,
    getRCodeForExpression: (expression: string) => string,
    getRCodeFragmentForNode: (nodeId: string, existingVariables: string[]) => RCodeFragment
): RCodeFragment => {
    const node = getNode(nodeId);
    if (node.type == VARIABLE_NODE_TYPE) {
        if (node.function.type == ESTIMATE_FUNCTION_TYPE) {
            return {
                definedVariables: [node.function.variable],
                code: null
            };
        } else if (node.function.type == OPERATION_FUNCTION_TYPE || node.function.type == RESULT_FUNCTION_TYPE) {
            const nodeDependencies = getVariableDependencies(node.id).map(v =>
                getNode(getNodeIdForVariable(v))
            ) as VariableNode[];

            const dependencyFragment = getCombinedRCodeFragmentForVariableDependencies(
                nodeDependencies,
                existingVariables,
                getRCodeFragmentForNode
            );

            return combineRCodeFragments(dependencyFragment, {
                definedVariables: [node.function.variable],
                code:
                    `# ${node.visualization.title}${R_CODE_LINE_BREAK}` +
                    `${node.function.variable} <- ${getRCodeForExpression(node.function.expression)}`
            });
        } else if (node.function.type == LOOP_FUNCTION_TYPE) {
            const nodeDependencies = getVariableDependencies(node.id).map(v =>
                getNode(getNodeIdForVariable(v))
            ) as VariableNode[];

            const dependencyFragment = getCombinedRCodeFragmentForVariableDependencies(
                nodeDependencies,
                existingVariables,
                getRCodeFragmentForNode
            );

            return combineRCodeFragments(dependencyFragment, {
                definedVariables: [node.function.variable],
                code:
                    `# ${node.visualization.title}${R_CODE_LINE_BREAK}` +
                    `${node.function.variable} <- ` +
                    `numeric(${getRCodeForExpression(node.function.iterationsExpression)})${R_CODE_LINE_BREAK}` +
                    `for (i in 1:length(${node.function.variable})) {${R_CODE_LINE_BREAK}` +
                    `    if (i == 1) {${R_CODE_LINE_BREAK}` +
                    `        ${node.function.variable}[1] <- ` +
                    `${getRCodeForExpression(node.function.initExpression)}${R_CODE_LINE_BREAK}` +
                    `    } else {${R_CODE_LINE_BREAK}` +
                    `        previous <- ${node.function.variable}[i-1]${R_CODE_LINE_BREAK}` +
                    `        ${node.function.variable}[i] <- ` +
                    `${getRCodeForExpression(node.function.loopExpression)}${R_CODE_LINE_BREAK}` +
                    `    }${R_CODE_LINE_BREAK}` +
                    `}`
            });
        }
        throw new Error(`cannot generate code for node function type ${(node.function as any).type}`);
    }
    throw new Error(`cannot generate code for node type ${node.type}`);
};
