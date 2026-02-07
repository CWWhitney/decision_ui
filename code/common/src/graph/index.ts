import { Schema } from "jsonschema";
import { Edge, EdgeSchema } from "./edge";
import { getSubgraphNodeIdForNode, Node, NodeId, NodeSchema } from "./node";

export * from "./node";
export * from "./edge";

export interface Graph {
    nodes: Node[];
    edges: Edge[];
}

export const GraphSchema: Schema = {
    type: "object",
    properties: {
        nodes: { type: "array", items: NodeSchema },
        edges: { type: "array", items: EdgeSchema }
    },
    required: ["nodes", "edges"]
};

export const filterNodesVisibleInSubgraph = (
    targetSubgraphNodeId: NodeId | null,
    nodes: Node[],
    getAncestorNodes: (node: Node) => Node[]
) => {
    return nodes.filter(n => getSubgraphNodeIdForNode(n, getAncestorNodes) == targetSubgraphNodeId);
};
