import { Node, NodeId, SubgraphId } from "./node/base";

export const filterNodesVisibleInSubgraph = (targetSubgraphId: SubgraphId | null, nodes: Node[]) => {
    return nodes.filter(n => n.subgraphParentId == targetSubgraphId);
};

export const projectNodeToSubgraph = (
    node: Node,
    targetSubgraphNodeId: SubgraphId,
    getSubgraphAncestors: (nodeId: NodeId) => Node[]
): Node | null => {
    if (node.subgraphParentId == targetSubgraphNodeId) {
        return node;
    }

    for (const subgraphNode of getSubgraphAncestors(node.id)) {
        if (subgraphNode.subgraphParentId == targetSubgraphNodeId) {
            return subgraphNode;
        }
    }

    return null;
};
