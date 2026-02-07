import { Node, NodeId } from "./base";
import { SUBGRAPH_NODE_TYPE } from "./type";

export const projectNodeToSubgraph = (
    node: Node,
    targetSubgraphNodeId: NodeId,
    getAncestorNodes: (node: Node) => Node[]
): Node | null => {
    const nodeSubgraphNodeId = getSubgraphNodeIdForNode(node, getAncestorNodes);
    if (nodeSubgraphNodeId == targetSubgraphNodeId) {
        return node;
    }

    for (const subgraphNode of getAncestorSubgraphNodesForNode(node, getAncestorNodes)) {
        if (getSubgraphNodeIdForNode(subgraphNode, getAncestorNodes) == targetSubgraphNodeId) {
            return subgraphNode;
        }
    }

    return null;
};

export const getAncestorSubgraphNodesForNode = (node: Node, getAncestorNodes: (node: Node) => Node[]): Node[] => {
    return getAncestorNodes(node).filter(n => n.type == SUBGRAPH_NODE_TYPE);
};

export const getSubgraphNodeIdForNode = (node: Node, getAncestorNodes: (node: Node) => Node[]): NodeId | null => {
    const subgraphNodes = getAncestorSubgraphNodesForNode(node, getAncestorNodes);
    if (subgraphNodes.length > 0) {
        return subgraphNodes[0].id;
    }
    return null;
};
