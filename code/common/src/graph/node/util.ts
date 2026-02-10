import { generateVariableName } from "../../compute";
import { Position, Size } from "../../editor/layout";
import { Node, NodeId, SubgraphId } from "./base";
import { getDefaultFunctionState, getDefaultNodeSize, getDefaultNodeStyleState } from "./default";
import { NodeFunctionType } from "./function";
import { NodeStyleType } from "./style";
import { NodeType } from "./type";

export type NodeByIdMap = Map<NodeId, Node>;

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

export const getNextNodeId = (nodes: Node[]): NodeId => {
    return `${nodes.reduce((i: number, node) => Math.max(parseInt(node.id) ?? 0, i), 0) + 1}`;
};

export interface NewNodeOptions {
    nodeParentId?: NodeId | null;
    subgraphParentId?: SubgraphId | null;
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
        nodeParentId: options?.nodeParentId ?? null,
        subgraphParentId: options?.subgraphParentId ?? null,
        function: getDefaultFunctionState(variable, functionType),
        visualization: {
            title: nodeTitle,
            position: options?.position ?? { x: 0, y: 0 },
            size: options?.size ?? getDefaultNodeSize(nodeType),
            style: getDefaultNodeStyleState(styleType),
            autoConnect: true
        }
    } as Node;
};
