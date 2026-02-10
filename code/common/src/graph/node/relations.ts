import { Node, NodeId, SubgraphId } from "./base";
import { getNodeByIdFromMap, getNodeByIdMap } from "./util";

export type NodeChildrenByParentIdMap = Map<NodeId, Node[]>;
export type SubgraphChildrenByParentIdMap = Map<SubgraphId, Node[]>;

export const getNodeChildrenByParentIdMap = (nodes: Node[]): NodeChildrenByParentIdMap => {
    const map = new Map<NodeId, Node[]>();
    for (const node of nodes) {
        if (!node.nodeParentId) {
            continue;
        }
        const children = map.get(node.nodeParentId);
        if (children) {
            children.push(node);
        } else {
            map.set(node.nodeParentId, [node]);
        }
    }
    return map;
};

export const getSubgraphChildrenByParentIdMap = (nodes: Node[]): SubgraphChildrenByParentIdMap => {
    const map = new Map<NodeId, Node[]>();
    for (const node of nodes) {
        if (!node.subgraphParentId) {
            continue;
        }
        const children = map.get(node.subgraphParentId);
        if (children) {
            children.push(node);
        } else {
            map.set(node.subgraphParentId, [node]);
        }
    }
    return map;
};

export const getNodeAncestorsRecursion = (
    node: Node,
    getNode: (nodeId: string) => Node,
    self: (node: Node, getNode: (nodeId: string) => Node) => Node[]
): Node[] => {
    if (node.nodeParentId) {
        const parentNode = getNode(node.nodeParentId);
        return [parentNode, ...self(parentNode, getNode)];
    }
    return [] as Node[];
};

export const getNodeDescendantsRecursion = (
    node: Node,
    nodeChildrenByParentId: Map<NodeId, Node[]>,
    self: (node: Node, nodeChildrenByParentId: Map<NodeId, Node[]>) => Node[]
): Node[] => {
    return (nodeChildrenByParentId.get(node.id) ?? []).reduce(
        (p, n) => [...p, n, ...self(n, nodeChildrenByParentId)],
        [] as Node[]
    );
};

export const getNodeAncestorsSlow = (node: Node, nodes: Node[]) => {
    const nodeByIdMap = getNodeByIdMap(nodes);
    const getNode = (nodeId: NodeId) => getNodeByIdFromMap(nodeId, nodeByIdMap);
    const _getNodeAncestors = (node: Node, getNode: (nodeId: string) => Node) =>
        getNodeAncestorsRecursion(node, getNode, _getNodeAncestors);
    return _getNodeAncestors(node, getNode);
};

export const getNodeDescendantsSlow = (node: Node, nodes: Node[]): Node[] => {
    const childrenByParentIdMap = getNodeChildrenByParentIdMap(nodes);
    const _getNodeDescendants = (node: Node, childrenByParentIdMap: Map<NodeId, Node[]>) =>
        getNodeDescendantsRecursion(node, childrenByParentIdMap, _getNodeDescendants);
    return _getNodeDescendants(node, childrenByParentIdMap);
};

export const getSubgraphAncestorsRecursion = (
    node: Node,
    getNode: (nodeId: string) => Node,
    self: (node: Node, getNode: (nodeId: string) => Node) => Node[]
): Node[] => {
    if (node.subgraphParentId) {
        const parentNode = getNode(node.subgraphParentId);
        return [parentNode, ...self(parentNode, getNode)];
    }
    return [] as Node[];
};

export const getSubgraphDescendantsRecursion = (
    node: Node,
    subgraphChildrenByParentId: Map<SubgraphId, Node[]>,
    self: (node: Node, subgraphChildrenByParentId: Map<SubgraphId, Node[]>) => Node[]
): Node[] => {
    return (subgraphChildrenByParentId.get(node.id) ?? []).reduce(
        (p, n) => [...p, n, ...self(n, subgraphChildrenByParentId)],
        [] as Node[]
    );
};

export const getSubgraphAncestorsSlow = (node: Node, nodes: Node[]) => {
    const nodeByIdMap = getNodeByIdMap(nodes);
    const getNode = (nodeId: NodeId) => getNodeByIdFromMap(nodeId, nodeByIdMap);
    const _getSubgraphAncestors = (node: Node, getNode: (nodeId: string) => Node) =>
        getSubgraphAncestorsRecursion(node, getNode, _getSubgraphAncestors);
    return _getSubgraphAncestors(node, getNode);
};

export const getSubgraphDescendantsSlow = (node: Node, nodes: Node[]): Node[] => {
    const subgraphChildrenByParentId = getSubgraphChildrenByParentIdMap(nodes);
    const _getSubgraphDescendants = (node: Node, subgraphChildrenByParentIdMap: Map<NodeId, Node[]>) =>
        getSubgraphDescendantsRecursion(node, subgraphChildrenByParentIdMap, _getSubgraphDescendants);
    return _getSubgraphDescendants(node, subgraphChildrenByParentId);
};

export const getAnyAncestorsRecursion = (
    node: Node,
    getNode: (nodeId: string) => Node,
    self: (node: Node, getNode: (nodeId: string) => Node) => Node[]
): Node[] => {
    let descendants: Node[] = [];
    if (node.subgraphParentId) {
        const subgraphParent = getNode(node.subgraphParentId);
        descendants = [subgraphParent, ...self(subgraphParent, getNode)];
    }
    if (node.nodeParentId) {
        const nodeParent = getNode(node.nodeParentId);
        descendants = [...descendants, nodeParent, ...self(nodeParent, getNode)];
    }
    return descendants;
};

export const getAnyAncestorsSlow = (node: Node, nodes: Node[]) => {
    const nodeByIdMap = getNodeByIdMap(nodes);
    const getNode = (nodeId: NodeId) => getNodeByIdFromMap(nodeId, nodeByIdMap);
    const _getAnyAncestors = (node: Node, getNode: (nodeId: string) => Node) =>
        getAnyAncestorsRecursion(node, getNode, _getAnyAncestors);
    return _getAnyAncestors(node, getNode);
};

export const getAnyDescendantsRecursion = (
    node: Node,
    subgraphChildrenByParentId: Map<SubgraphId, Node[]>,
    nodeChildrenByParentId: Map<SubgraphId, Node[]>,
    self: (
        node: Node,
        subgraphChildrenByParentId: Map<SubgraphId, Node[]>,
        nodeChildrenByParentId: Map<NodeId, Node[]>
    ) => Node[]
): Node[] => {
    return [
        ...(subgraphChildrenByParentId.get(node.id) ?? []).reduce(
            (p, n) => [...p, n, ...self(n, subgraphChildrenByParentId, nodeChildrenByParentId)],
            [] as Node[]
        ),
        ...(nodeChildrenByParentId.get(node.id) ?? []).reduce(
            (p, n) => [...p, n, ...self(n, subgraphChildrenByParentId, nodeChildrenByParentId)],
            [] as Node[]
        )
    ];
};

export const getAnyDescendantsSlow = (node: Node, nodes: Node[]): Node[] => {
    const subgraphChildrenByParentId = getSubgraphChildrenByParentIdMap(nodes);
    const nodeChildrenByParentId = getNodeChildrenByParentIdMap(nodes);
    const _getAnyDescendants = (
        node: Node,
        subgraphChildrenByParentId: Map<SubgraphId, Node[]>,
        nodeChildrenByParentId: Map<NodeId, Node[]>
    ) => getAnyDescendantsRecursion(node, subgraphChildrenByParentId, nodeChildrenByParentId, _getAnyDescendants);
    return _getAnyDescendants(node, subgraphChildrenByParentId, nodeChildrenByParentId);
};
