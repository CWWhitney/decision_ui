import { generateVariableName } from "../../compute";
import { Position, Size } from "../../draw";
import { Node, NodeId } from "./base";
import { getDefaultFunctionState, getDefaultNodeSize, getDefaultNodeStyleState } from "./default";
import { NodeFunctionType } from "./function";
import { NodeStyleType } from "./style";
import { NodeType } from "./type";

export type NodeByIdMap = Map<NodeId, Node>;
export type NodeChildrenByParentIdMap = Map<NodeId, Node[]>;

/**
 * Return a map from node id to node state for a list of nodes.
 *
 * @param nodes the list of nodes
 * @returns a map of nodes from id to node state
 */
export const getNodeByIdMap = (nodes: Node[]): NodeByIdMap => {
    return new Map(nodes.map(n => [n.id, n]));
};

export const getNodeByIdFromMap = (nodeId: NodeId, nodeMap: NodeByIdMap) => {
    const node = nodeMap.get(nodeId);
    if (!node) {
        throw new Error(`could not find node '${nodeId}' in graph`);
    }
    return node;
};

export const getNodeChildrenByParentIdMap = (nodes: Node[]): NodeChildrenByParentIdMap => {
    const map = new Map<NodeId, Node[]>();

    for (const node of nodes) {
        if (!node.parentNodeId) {
            continue;
        }

        const children = map.get(node.parentNodeId);
        if (children) {
            children.push(node);
        } else {
            map.set(node.parentNodeId, [node]);
        }
    }

    return map;
};

export const getNodePositionRecursion = (
    nodeId: NodeId,
    getNode: (nodeId: NodeId) => Node,
    self: (nodeId: NodeId, getNode: (nodeId: NodeId) => Node) => Position
): Position => {
    const node = getNode(nodeId);

    if (!node.parentNodeId) {
        return node.visualization.position;
    }

    return {
        x: node.visualization.position.x + self(node.parentNodeId, getNode).x,
        y: node.visualization.position.y + self(node.parentNodeId, getNode).y
    } as Position;
};

export const getNodePosition = (nodeId: NodeId, getNode: (nodeId: NodeId) => Node): Position =>
    getNodePositionRecursion(nodeId, getNode, getNodePosition);

export const getNextNodeId = (nodes: Node[]): NodeId => {
    return `${nodes.reduce((i: number, node) => Math.max(parseInt(node.id) ?? 0, i), 0) + 1}`;
};

export interface NewNodeOptions {
    parentNodeId?: NodeId | null;
    position?: Position;
    size?: Size;
}

export const getNewNode = (
    title: string,
    nodeType: NodeType,
    functionType: NodeFunctionType,
    styleType: NodeStyleType,
    nodes: Node[],
    options?: NewNodeOptions
): Node => {
    const nextNodeId = getNextNodeId(nodes);
    const nodeTitle = `${title} ${nextNodeId}`;
    const variable = generateVariableName(nodeTitle);
    return {
        id: nextNodeId,
        type: nodeType,
        parentNodeId: options?.parentNodeId ?? null,
        function: getDefaultFunctionState(variable, functionType),
        visualization: {
            title: nodeTitle,
            position: options?.position ?? { x: 0, y: 0 },
            size: options?.size ?? getDefaultNodeSize(nodeType),
            style: getDefaultNodeStyleState(styleType)
        }
    } as Node;
};

export const getAncestorNodesRecursion = (
    node: Node,
    getNode: (nodeId: string) => Node,
    self: (node: Node, getNode: (nodeId: string) => Node) => Node[]
): Node[] => {
    if (node.parentNodeId) {
        const parentNode = getNode(node.parentNodeId);
        return [parentNode, ...self(parentNode, getNode)];
    }
    return [] as Node[];
};

export const getDescendantNodesRecursion = (
    node: Node,
    childrenByParentIdMap: Map<NodeId, Node[]>,
    self: (node: Node, childrenByParentIdMap: Map<NodeId, Node[]>) => Node[]
): Node[] => {
    return (childrenByParentIdMap.get(node.id) ?? []).reduce(
        (p, n) => [...p, n, ...self(n, childrenByParentIdMap)],
        [] as Node[]
    );
};

export const getAncestorNodesSlow = (node: Node, nodes: Node[]) => {
    const nodeByIdMap = getNodeByIdMap(nodes);
    const getNode = (nodeId: NodeId) => getNodeByIdFromMap(nodeId, nodeByIdMap);
    const _getAncestorNodes = (node: Node, getNode: (nodeId: string) => Node) =>
        getAncestorNodesRecursion(node, getNode, _getAncestorNodes);
    return _getAncestorNodes(node, getNode);
};

export const getDescendantNodesSlow = (node: Node, nodes: Node[]): Node[] => {
    const childrenByParentIdMap = getNodeChildrenByParentIdMap(nodes);
    const _getDescendantNodes = (node: Node, childrenByParentIdMap: Map<NodeId, Node[]>) =>
        getDescendantNodesRecursion(node, childrenByParentIdMap, _getDescendantNodes);
    return _getDescendantNodes(node, childrenByParentIdMap);
};
