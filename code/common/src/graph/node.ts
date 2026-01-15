import { ComputationResult } from "../compute";
import { Position, Size } from "../draw";
import { DistributionFunctionType } from "../math";

export const ESTIMATE_NODE_TYPE = "estimate";
export const OPERATION_NODE_TYPE = "operation";
export const LOOP_NODE_TYPE = "loop";
export const RESULT_NODE_TYPE = "result";
export const COLLECTION_NODE_TYPE = "collection";

export type EstimateNodeType = "estimate";
export type OperationNodeType = "operation";
export type LoopNodeType = "loop";
export type ResultNodeType = "result";
export type CollectionNodeType = "collection";

export type NodeId = string;

export type NodeType =
  | EstimateNodeType
  | OperationNodeType
  | LoopNodeType
  | ResultNodeType
  | CollectionNodeType;

export const AVAILABLE_NODE_TYPES: NodeType[] = [
  ESTIMATE_NODE_TYPE,
  OPERATION_NODE_TYPE,
  LOOP_NODE_TYPE,
  RESULT_NODE_TYPE,
  COLLECTION_NODE_TYPE,
];

export const DEFAULT_NODE_TYPE_TITLES: { [key in NodeType]: string } = {
  [ESTIMATE_NODE_TYPE]: "Estimate",
  [OPERATION_NODE_TYPE]: "Operation",
  [LOOP_NODE_TYPE]: "Loop",
  [RESULT_NODE_TYPE]: "Result",
  [COLLECTION_NODE_TYPE]: "Collection",
};

export const DEFAUL_NODE_DIMENSIONS: { [key in NodeType]: Size } = {
  [ESTIMATE_NODE_TYPE]: { width: 200, height: 50 },
  [OPERATION_NODE_TYPE]: { width: 200, height: 50 },
  [LOOP_NODE_TYPE]: { width: 500, height: 400 },
  [RESULT_NODE_TYPE]: { width: 200, height: 50 },
  [COLLECTION_NODE_TYPE]: { width: 500, height: 400 },
};

export interface AbstractNode<T, O> {
  id: NodeId;
  type: T;
  parentNodeId: NodeId | null;

  visualization: {
    title: string;
    position: Position;
    size: Size;
  };

  options: O;

  computation: {
    result: ComputationResult;
    errors: string[];
  };
}

export interface EstimateNodeOptions {
  distribution: DistributionFunctionType;
  lower: number;
  upper: number;
  comment: string;
}

export interface OperationNodeOptions {
  expression: string;
}

export interface ResultNodeOptions {
  variables: string[];
  colors: string[];
}

export type ResultNode = AbstractNode<ResultNodeType, ResultNodeOptions>;

export type CollectionNode = AbstractNode<CollectionNodeType, null>;
export type LoopNode = AbstractNode<LoopNodeType, null>;

export type OperationNode = AbstractNode<
  OperationNodeType,
  OperationNodeOptions
>;
export type EstimateNode = AbstractNode<EstimateNodeType, EstimateNodeOptions>;

export type NodeOptionsTypeMap = {
  [ESTIMATE_NODE_TYPE]: EstimateNodeOptions;
  [OPERATION_NODE_TYPE]: OperationNodeOptions;
  [LOOP_NODE_TYPE]: null;
  [RESULT_NODE_TYPE]: ResultNodeOptions;
  [COLLECTION_NODE_TYPE]: null;
};

export const DEFAULT_NODE_OPTIONS: {
  [nodeType in NodeType]: NodeOptionsTypeMap[nodeType];
} = {
  [ESTIMATE_NODE_TYPE]: {
    distribution: "deterministic",
    lower: 1,
    upper: 1,
    comment: "",
  },
  [OPERATION_NODE_TYPE]: {
    expression: "",
  },
  [LOOP_NODE_TYPE]: null,
  [RESULT_NODE_TYPE]: {
    variables: [],
    colors: [],
  },
  [COLLECTION_NODE_TYPE]: null,
};

export type Node =
  | ResultNode
  | OperationNode
  | LoopNode
  | EstimateNode
  | CollectionNode;

export type NodeByIdMap = Map<NodeId, Node>;
export type NodeChildrenByParentIdMap = Map<NodeId, Node[]>;

/**
 * Return a map from node id to node state for a list of nodes.
 *
 * @param nodes the list of nodes
 * @returns a map of nodes from id to node state
 */
export const getNodeByIdMap = (nodes: Node[]): NodeByIdMap => {
  return new Map(nodes.map((n) => [n.id, n]));
};

export const getNodeByIdFromMap = (nodeId: NodeId, nodeMap: NodeByIdMap) => {
  const node = nodeMap.get(nodeId);
  if (!node) {
    throw new Error(`could not find node '${nodeId}' in graph`);
  }
  return node;
};

export const getChildrenByParentIdMap = (
  nodes: Node[]
): NodeChildrenByParentIdMap => {
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
    y: node.visualization.position.y + self(node.parentNodeId, getNode).y,
  } as Position;
};

export const getNodePosition = (
  nodeId: NodeId,
  getNode: (nodeId: NodeId) => Node
): Position => getNodePositionRecursion(nodeId, getNode, getNodePosition);

export const getNextNodeId = (nodes: Node[]): NodeId => {
  return `${
    nodes.reduce((i: number, node) => Math.max(parseInt(node.id) ?? 0, i), 0) +
    1
  }`;
};

export interface NewNodeOptions {
  parentNodeId?: NodeId | null;
  position?: Position;
  size?: Size;
}

export const getNewNode = (
  nodeType: NodeType,
  nodes: Node[],
  options?: NewNodeOptions
): Node => {
  const nextNodeId = getNextNodeId(nodes);
  return {
    id: nextNodeId,
    type: nodeType,
    parentNodeId: options?.parentNodeId ?? null,
    visualization: {
      title: `${DEFAULT_NODE_TYPE_TITLES[nodeType]} ${nextNodeId}`,
      position: options?.position ?? { x: 0, y: 0 },
      size: options?.size ?? DEFAUL_NODE_DIMENSIONS[nodeType],
    },
    computation: {
      result: {
        value: null,
        type: null,
      },
      errors: [],
    },
    options: DEFAULT_NODE_OPTIONS[nodeType],
  } as Node;
};

export const getAncestorNodesRecursion = (
  nodeId: NodeId,
  getNode: (nodeId: string) => Node,
  self: (nodeId: NodeId, getNode: (nodeId: string) => Node) => Node[]
): Node[] => {
  const node = getNode(nodeId);
  if (node.parentNodeId) {
    const parentNode = getNode(node.parentNodeId);
    return [parentNode, ...self(parentNode.id, getNode)];
  }
  return [] as Node[];
};

export const getDescendantNodesRecursion = (
  nodeId: NodeId,
  childrenByParentIdMap: Map<NodeId, Node[]>,
  self: (nodeId: NodeId, childrenByParentIdMap: Map<NodeId, Node[]>) => Node[]
): Node[] => {
  return (childrenByParentIdMap.get(nodeId) ?? []).reduce(
    (p, n) => [...p, n, ...self(n.id, childrenByParentIdMap)],
    [] as Node[]
  );
};
