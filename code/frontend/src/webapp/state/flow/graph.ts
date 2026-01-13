import { computed, type ComputedRef } from "vue";
import type { AvailableDistributionsType } from "@/editor/distributions";
import type { Dimensions, XYPosition } from "@vue-flow/core";

import {
  type Node as VueFlowNode,
  type Edge as VueFlowEdge,
  MarkerType,
  type Connection as VueFlowConnection
} from "@vue-flow/core";
import { getHandlePositions } from "@/common/layout";
import { defineStore } from "pinia";
import { useSessionStorage } from "@vueuse/core";

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

export type NodeTypes = EstimateNodeType | OperationNodeType | LoopNodeType | ResultNodeType | CollectionNodeType;
export const AVAILABLE_NODE_TYPES: NodeTypes[] = [
  ESTIMATE_NODE_TYPE,
  OPERATION_NODE_TYPE,
  LOOP_NODE_TYPE,
  RESULT_NODE_TYPE,
  COLLECTION_NODE_TYPE
];

export const DEFAULT_NODE_TYPE_TITLES: { [key in NodeTypes]: string } = {
  [ESTIMATE_NODE_TYPE]: "Estimate",
  [OPERATION_NODE_TYPE]: "Operation",
  [LOOP_NODE_TYPE]: "Loop",
  [RESULT_NODE_TYPE]: "Result",
  [COLLECTION_NODE_TYPE]: "Collection"
};

export const DEFAUL_NODE_DIMENSIONS: { [key in NodeTypes]: Dimensions } = {
  [ESTIMATE_NODE_TYPE]: { width: 200, height: 50 },
  [OPERATION_NODE_TYPE]: { width: 200, height: 50 },
  [LOOP_NODE_TYPE]: { width: 500, height: 400 },
  [RESULT_NODE_TYPE]: { width: 200, height: 50 },
  [COLLECTION_NODE_TYPE]: { width: 500, height: 400 }
};

export interface EstimateDefinitionState {
  distribution: AvailableDistributionsType;
  lower: number;
  upper: number;
  comment: string;
}

export interface OperationDefinitionState {
  expression: string;
}

export interface ResultsDefinitionState {
  variables: string[];
  colors: string[];
}

export interface EstimateNodeState extends BaseNodeState {
  type: EstimateNodeType;
  estimate: EstimateDefinitionState;
}

export interface OperationNodeState extends BaseNodeState {
  type: OperationNodeType;
  operation: OperationDefinitionState;
}

export interface LoopNodeState extends BaseNodeState {
  type: LoopNodeType;
}

export interface ResultNodeState extends BaseNodeState {
  type: ResultNodeType;
  results: ResultsDefinitionState;
}

export interface CollectionNodeSate extends BaseNodeState {
  type: CollectionNodeType;
}

export interface BaseNodeState {
  id: string;
  type: NodeTypes;
  position: XYPosition;
  dimensions: Dimensions;
  title: string;
  parentNodeId: string | null;
}

export type NodeState = ResultNodeState | OperationNodeState | LoopNodeState | EstimateNodeState | CollectionNodeSate;

export interface EdgeState {
  id: string;
  source: string;
  target: string;
}

export const FLOW_GRAPH_STORE_ID = "flow.graph";

export const useFlowGraphStore = defineStore(FLOW_GRAPH_STORE_ID, () => {
  const nodes = useSessionStorage(`${FLOW_GRAPH_STORE_ID}.nodes`, [] as NodeState[]);
  const edges = useSessionStorage(`${FLOW_GRAPH_STORE_ID}.edges`, [] as EdgeState[]);

  const reset = () => {
    nodes.value = [];
    edges.value = [];
  };

  const _nodesByIdMap = computed(() => {
    return Object.fromEntries(nodes.value.map(n => [n.id, n])) as { [key: string]: NodeState };
  });

  const _childrenByParentIdMap = computed(() => {
    const map = new Map<string, NodeState[]>();

    for (const node of nodes.value) {
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
  });

  const getVueFlowNodes = () =>
    computed(() => {
      return nodes.value.map(
        node =>
          ({
            id: node.id,
            position: node.position,
            type: "custom",
            class: node.type,
            width: node.dimensions.width,
            height: node.dimensions.height,
            parentNode: node.parentNodeId,
            extent: "parent",
            expandParent: true,
            data: {
              label: node.title
            }
          }) as VueFlowNode
      );
    });

  const getScreenSpacePosition = (nodeId: string): ComputedRef<XYPosition> =>
    computed(() => {
      const node = getNode(nodeId).value;

      if (!node.parentNodeId) {
        return node.position;
      }

      return {
        x: node.position.x + getScreenSpacePosition(node.parentNodeId).value.x,
        y: node.position.y + getScreenSpacePosition(node.parentNodeId).value.y
      } as XYPosition;
    });

  const getVueFlowEdges = () =>
    computed(() => {
      return edges.value.map(edge => {
        const sourceNodePosition = getScreenSpacePosition(edge.source).value;
        const targetNodePosition = getScreenSpacePosition(edge.target).value;

        const [sourceHandle, targetHandle] = getHandlePositions(sourceNodePosition, targetNodePosition);

        return {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: sourceHandle,
          targetHandle: targetHandle,
          type: "custom",
          markerEnd: MarkerType.Arrow
        } as VueFlowEdge;
      });
    });

  const getNode = (nodeId: string) =>
    computed(() => {
      const node = _nodesByIdMap.value[nodeId];
      if (!node) {
        throw new Error(`could not find node '${nodeId}' in graph`);
      }
      return node;
    });

  const addEdgeFromVueFlowConnection = (connection: VueFlowConnection) => {
    const edge_id = `${connection.source}-${connection.target}`;
    edges.value = edges.value.filter(e => e.id != edge_id);
    edges.value.push({
      ...connection,
      id: edge_id
    });
  };

  const removeEdge = (edge_id: string) => {
    edges.value = edges.value.filter(e => e.id != edge_id);
  };

  const updateNodePosition = (node_id: string, node_position: XYPosition) => {
    const node = getNode(node_id).value;
    node.position = node_position;
  };

  const updateNodeDimensions = (node_id: string, node_dimensions: Dimensions) => {
    const node = getNode(node_id).value;
    node.dimensions = node_dimensions;
  };

  const maxNodeId = computed(() => nodes.value.reduce((i: number, node) => Math.max(parseInt(node.id) ?? 0, i), 0));

  const addNode = (
    nodeType: NodeTypes,
    params?: { parentNodeId?: string | null; position?: XYPosition | null; dimensions?: Dimensions | null }
  ) => {
    const uniqueId = maxNodeId.value + 1;
    const baseNodeState = {
      id: `${uniqueId}`,
      title: `${DEFAULT_NODE_TYPE_TITLES[nodeType]} ${uniqueId}`,
      position: params?.position ?? { x: 0, y: 0 },
      dimensions: params?.dimensions ?? DEFAUL_NODE_DIMENSIONS[nodeType],
      parentNodeId: params?.parentNodeId ?? null
    };

    if (nodeType == ESTIMATE_NODE_TYPE) {
      nodes.value.push({
        ...baseNodeState,
        type: nodeType,
        estimate: {
          distribution: "deterministic",
          lower: 1,
          upper: 1,
          comment: ""
        }
      });
    } else if (nodeType == OPERATION_NODE_TYPE) {
      nodes.value.push({
        ...baseNodeState,
        type: nodeType,
        operation: {
          expression: ""
        }
      });
    } else if (nodeType == LOOP_NODE_TYPE) {
      nodes.value.push({
        ...baseNodeState,
        type: nodeType
      });
    } else if (nodeType == RESULT_NODE_TYPE) {
      nodes.value.push({
        ...baseNodeState,
        type: nodeType,
        results: {
          variables: [],
          colors: []
        }
      });
    } else if (nodeType == COLLECTION_NODE_TYPE) {
      nodes.value.push({
        ...baseNodeState,
        type: nodeType
      });
    }

    return `${uniqueId}`;
  };

  const getAncestorNodes = (node: NodeState): ComputedRef<NodeState[]> =>
    computed(() => {
      if (node.parentNodeId) {
        const parentNode = getNode(node.parentNodeId).value;
        return [parentNode, ...getAncestorNodes(parentNode).value];
      }
      return [] as NodeState[];
    });

  const getDescendantNodes = (node: NodeState): ComputedRef<NodeState[]> =>
    computed(() => {
      return (_childrenByParentIdMap.value.get(node.id) ?? []).reduce(
        (p, n) => [...p, n, ...getDescendantNodes(n).value],
        [] as NodeState[]
      );
    });

  const removeNode = (node_id: string) => {
    const node = getNode(node_id).value;
    const removeNodeIds = [node_id, ...getDescendantNodes(node).value.map(n => n.id)];
    const removeEdgeIds = edges.value
      .filter(e => removeNodeIds.includes(e.source) || removeNodeIds.includes(e.target))
      .map(e => e.id);
    nodes.value = nodes.value.filter(n => !removeNodeIds.includes(n.id));
    edges.value = edges.value.filter(e => !removeEdgeIds.includes(e.id));
  };

  return {
    nodes,
    edges,
    getVueFlowNodes,
    getVueFlowEdges,
    getNode,
    getAncestorNodes,
    getDescendantNodes,
    addEdgeFromVueFlowConnection,
    removeEdge,
    updateNodePosition,
    updateNodeDimensions,
    addNode,
    removeNode,
    reset
  };
});
