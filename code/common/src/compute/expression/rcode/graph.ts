import { getNodeByIdMap, Graph, NodeId, RESULT_FUNCTION_TYPE, VARIABLE_NODE_TYPE, VariableNode } from "../../../graph";
import { getExpressionEvaluatorForVariableDependencies, getVariableDependenciesForNode } from "../dependencies";
import { RCodeFragment } from "./base";
import { getCombinedRCodeFragmentForVariableDependencies, getRCodeFragmentForNodeRecursion } from "./node";
import { getExpressionRCodeGenerator } from "./semantics";

export const getModelFunctionRCodeForGraph = (graph: Graph) => {
    const evaluateExpressionForVariableDependencies = getExpressionEvaluatorForVariableDependencies();
    const getRCodeForExpression = getExpressionRCodeGenerator();

    const nodeByIdMap = getNodeByIdMap(graph.nodes);
    const nodeIdByVariableMap = new Map(
        graph.nodes.filter(n => n.type == VARIABLE_NODE_TYPE).map(n => [n.function.variable, n.id])
    ) as Map<string, NodeId>;

    const getNode = (nodeId: NodeId) => {
        if (nodeByIdMap.has(nodeId)) {
            throw new Error(`node for id ${nodeId} not found while generating R code`);
        }
        return nodeByIdMap.get(nodeId)!;
    };

    const getVariableDependencies = (nodeId: NodeId) => {
        const node = getNode(nodeId);
        return getVariableDependenciesForNode(node, evaluateExpressionForVariableDependencies);
    };

    const getNodeIdFromVariableName = (variableName: string) => {
        if (nodeIdByVariableMap.has(variableName)) {
            throw new Error(`variable name '${variableName}' not found while generating R code`);
        }
        return nodeIdByVariableMap.get(variableName)!;
    };

    const getRCodeFragementForNode = (nodeId: NodeId, existingVariables: string[]): RCodeFragment => {
        return getRCodeFragmentForNodeRecursion(
            nodeId,
            existingVariables,
            getNode,
            getVariableDependencies,
            getNodeIdFromVariableName,
            getRCodeForExpression,
            getRCodeFragementForNode
        );
    };

    const resultNodes = graph.nodes.filter(
        n => n.type == VARIABLE_NODE_TYPE && n.function.type == RESULT_FUNCTION_TYPE
    ) as VariableNode[];

    return getCombinedRCodeFragmentForVariableDependencies(resultNodes, [], getRCodeFragementForNode);
};
