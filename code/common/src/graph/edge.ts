import { Schema } from "jsonschema";
import { Node, NodeId } from "./node";

export type EdgeId = string;

export interface Edge {
    id: EdgeId;
    source: NodeId;
    target: NodeId;
}

export const EdgeSchema: Schema = {
    type: "object",
    properties: {
        id: { type: "string" },
        source: { type: "string" },
        target: { type: "string" }
    },
    required: ["id", "source", "target"]
};

export const getEdgeIdForNodes = (source: NodeId, target: NodeId): EdgeId => {
    return `${source}-${target}`;
};

export const getComputationEdges = (
    nodes: Node[],
    getComputedVariableDependencies: (nodeId: string) => string[],
    isVariableNameValid: (variableName: string) => boolean,
    getNodeIdFromVariableName: (variableName: string) => NodeId
) => {
    return nodes.reduce((p, node) => {
        const dependencies = getComputedVariableDependencies(node.id);
        return [
            ...p,
            ...dependencies.filter(isVariableNameValid).map(d => {
                const source = getNodeIdFromVariableName(d);
                const target = node.id;
                return {
                    id: getEdgeIdForNodes(source, target),
                    source,
                    target
                };
            })
        ];
    }, [] as Edge[]);
};

export const filterManualEdgesByComputationEdges = (manualEdges: Edge[], computationEdges: Edge[]): Edge[] => {
    const computationEdgesIdSet = new Set(computationEdges.map(e => e.id));
    return manualEdges.filter(e => !computationEdgesIdSet.has(e.id));
};
