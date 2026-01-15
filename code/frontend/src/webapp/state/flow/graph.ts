import { computed, type ComputedRef } from "vue";

import {
  type Node as VueFlowNode,
  type Edge as VueFlowEdge,
  MarkerType,
  type Connection as VueFlowConnection
} from "@vue-flow/core";

import { getHandlePositions } from "@/common/layout";
import { defineStore } from "pinia";
import { useSessionStorage } from "@vueuse/core";

import {
  type ComputationResult,
  type Node,
  type Edge,
  type NodeType,
  getNodeByIdMap,
  getChildrenByParentIdMap,
  getNodeByIdFromMap,
  type NodeId,
  getEdgeIdForNodes,
  getNodePositionRecursion,
  type Position,
  type NewNodeOptions,
  getNewNode,
  getAncestorNodesRecursion,
  getDescendantNodesRecursion,
  type ComputationContext,
  getNodeComputationResult,
  type Size
} from "@decision-support-ui/common";
import { useProjectSettingsStore } from "../projects/settings";

export const FLOW_GRAPH_STORE_ID = "flow.graph";

const computedByNodeId = <T>(get: (nodeId: NodeId) => T) => {
  const cache = new Map<NodeId, ComputedRef<T>>();
  return (nodeId: NodeId): ComputedRef<T> => {
    if (!cache.has(nodeId)) {
      cache.set(
        nodeId,
        computed(() => get(nodeId))
      );
    }
    return cache.get(nodeId)!;
  };
};

export const useFlowGraphStore = defineStore(FLOW_GRAPH_STORE_ID, () => {
  const projectSettings = useProjectSettingsStore();

  const nodes = useSessionStorage(`${FLOW_GRAPH_STORE_ID}.nodes`, [] as Node[]);
  const edges = useSessionStorage(`${FLOW_GRAPH_STORE_ID}.edges`, [] as Edge[]);

  const computedComputationContext = computed(
    () =>
      ({
        mcRuns: projectSettings.mcRuns
      }) as ComputationContext
  );

  const reset = () => {
    nodes.value = [];
    edges.value = [];
  };

  const _nodesByIdMap = computed(() => getNodeByIdMap(nodes.value));
  const _childrenByParentIdMap = computed(() => getChildrenByParentIdMap(nodes.value));

  const getComputedNode = computedByNodeId((nodeId: NodeId) => getNodeByIdFromMap(nodeId, _nodesByIdMap.value));

  const getComputedNodePosition = computedByNodeId(
    (nodeId: NodeId): Position =>
      getNodePositionRecursion(
        nodeId,
        (nodeId: NodeId) => getComputedNode(nodeId).value,
        (nodeId: NodeId, _getNode: (nodeId: NodeId) => Node) => getComputedNodePosition(nodeId).value
      )
  );

  const getComputedVueFlowNodes = () =>
    computed(() => {
      return nodes.value.map(
        node =>
          ({
            id: node.id,
            position: node.visualization.position,
            type: "custom",
            class: node.type,
            width: node.visualization.size.width,
            height: node.visualization.size.height,
            parentNode: node.parentNodeId,
            extent: "parent",
            expandParent: true,
            data: {
              label: node.visualization.title
            }
          }) as VueFlowNode
      );
    });

  const getComputedVueFlowEdges = () =>
    computed(() => {
      return edges.value.map(edge => {
        const sourceNodePosition = getComputedNodePosition(edge.source).value;
        const targetNodePosition = getComputedNodePosition(edge.target).value;

        const [sourceHandle, targetHandle] = getHandlePositions(sourceNodePosition, targetNodePosition);

        return {
          id: edge.id,
          source: `${edge.source}`,
          target: `${edge.target}`,
          sourceHandle: sourceHandle,
          targetHandle: targetHandle,
          type: "custom",
          markerEnd: MarkerType.Arrow
        } as VueFlowEdge;
      });
    });

  const getComputedAncestorNodes = computedByNodeId((nodeId: NodeId): Node[] =>
    getAncestorNodesRecursion(
      nodeId,
      (nodeId: NodeId) => getComputedNode(nodeId).value,
      (nodeId: NodeId, _getNode: (nodeId: NodeId) => Node) => getComputedAncestorNodes(nodeId).value
    )
  );

  const getComputedDescendantNodes = computedByNodeId((nodeId: NodeId): Node[] =>
    getDescendantNodesRecursion(
      nodeId,
      _childrenByParentIdMap.value,
      (nodeId: NodeId, _childrenByParentIdMap: Map<NodeId, Node[]>) => getComputedDescendantNodes(nodeId).value
    )
  );

  const getComputedComputationResult = computedByNodeId(
    (nodeId: NodeId): ComputationResult =>
      getNodeComputationResult(getComputedNode(nodeId).value, computedComputationContext.value)
  );

  const addEdgeFromVueFlowConnectionAction = (connection: VueFlowConnection) => {
    const edgeId = getEdgeIdForNodes(connection.source, connection.target);
    edges.value = edges.value.filter(e => e.id != edgeId);
    edges.value.push({
      id: edgeId,
      source: connection.source,
      target: connection.target
    });
  };

  const removeEdgeAction = (edge_id: string) => {
    edges.value = edges.value.filter(e => e.id != edge_id);
  };

  const updateNodePositionAction = (nodeId: NodeId, position: Position) => {
    const node = getComputedNode(nodeId).value;
    node.visualization.position = position;
  };

  const updateNodeSizeAction = (nodeId: NodeId, size: Size) => {
    const node = getComputedNode(nodeId).value;
    node.visualization.size = size;
  };

  const addNewNodeAction = (nodeType: NodeType, options?: NewNodeOptions): NodeId => {
    const newNode = getNewNode(nodeType, nodes.value, options);
    nodes.value.push(newNode);
    return newNode.id;
  };

  const removeNodeAction = (nodeId: NodeId) => {
    const node = getComputedNode(nodeId).value;
    const removeNodeIds = [nodeId, ...getComputedDescendantNodes(node.id).value.map(n => n.id)];
    const removeEdgeIds = edges.value
      .filter(e => removeNodeIds.includes(e.source) || removeNodeIds.includes(e.target))
      .map(e => e.id);
    nodes.value = nodes.value.filter(n => !removeNodeIds.includes(n.id));
    edges.value = edges.value.filter(e => !removeEdgeIds.includes(e.id));
  };

  return {
    nodes,
    edges,
    getComputedVueFlowNodes,
    getComputedVueFlowEdges,
    getComputedNode,
    getComputedComputationResult,
    getComputedAncestorNodes,
    getComputedDescendantNodes,
    addEdgeFromVueFlowConnectionAction,
    removeEdgeAction,
    updateNodePositionAction,
    updateNodeSizeAction,
    addNewNodeAction,
    removeNodeAction,
    reset
  };
});
