import { Position } from "../../editor";
import { Node, NodeId } from "./base";

export const getNodeCenter = (node: Node): Position => {
    return {
        x: node.visualization.position.x + node.visualization.size.width / 2,
        y: node.visualization.position.y + node.visualization.size.height / 2
    };
};

export const getNodePositionRecursion = (
    nodeId: NodeId,
    getNode: (nodeId: NodeId) => Node,
    self: (nodeId: NodeId, getNode: (nodeId: NodeId) => Node) => Position
): Position => {
    const node = getNode(nodeId);

    if (!node.nodeParentId) {
        return node.visualization.position;
    }

    return {
        x: node.visualization.position.x + self(node.nodeParentId, getNode).x,
        y: node.visualization.position.y + self(node.nodeParentId, getNode).y
    } as Position;
};

export const getNodePosition = (nodeId: NodeId, getNode: (nodeId: NodeId) => Node): Position =>
    getNodePositionRecursion(nodeId, getNode, getNodePosition);
