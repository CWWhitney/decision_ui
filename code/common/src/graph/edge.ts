import { Schema } from "ajv";
import { Node, NodeId } from "./node";
import { projectNodeToSubgraph } from "./subgraph";

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
    getVariableDependencies: (nodeId: string) => string[],
    isVariableNameValid: (variableName: string) => boolean,
    getNodeIdFromVariableName: (variableName: string) => NodeId
) => {
    return nodes.reduce((p, node) => {
        const dependencies = getVariableDependencies(node.id);
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

export const projectEdgesToSubgraph = (
    edges: Edge[],
    subgraphNodeId: NodeId | null,
    getNode: (nodeId: NodeId) => Node,
    getSubgraphAncestors: (nodeId: NodeId) => Node[]
): Edge[] => {
    // project
    const projectedEdges = edges.map(e => {
        // console.log(`projecting edge ${e.id}`);
        const projectedSourceNode = projectNodeToSubgraph(getNode(e.source), subgraphNodeId, getSubgraphAncestors);
        const projectedTargetNode = projectNodeToSubgraph(getNode(e.target), subgraphNodeId, getSubgraphAncestors);

        if (projectedSourceNode && projectedTargetNode && projectedSourceNode.id != projectedTargetNode.id) {
            const newEdgeId = getEdgeIdForNodes(projectedSourceNode.id, projectedTargetNode.id);
            // console.log(`projecting edge ${e.id} to ${newEdgeId}`);
            return {
                id: newEdgeId,
                source: projectedSourceNode.id,
                target: projectedTargetNode.id
            };
        }
        return null;
    });

    // deduplicate
    const deduplicatedEdges = Object.values(
        Object.fromEntries(projectedEdges.filter(e => e != null).map(e => [e.id, e]))
    );

    return deduplicatedEdges;
};
