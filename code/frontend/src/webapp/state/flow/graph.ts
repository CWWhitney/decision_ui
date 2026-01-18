import { computed, type ComputedRef } from "vue";
import * as tf from "@tensorflow/tfjs";

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
  type Size,
  OPERATION_NODE_TYPE,
  type VariableDependencies,
  getExpressionEvaluatorForVariableDependencies,
  getExpressionEvaluatorForTensor,
  getTensorForNodeRecursion,
  getComputationValueForNode
} from "@decision-support-ui/common";
import { useProjectSettingsStore } from "../projects/settings";
import { generateVariableName } from "@/editor/common/variables";

export const FLOW_GRAPH_STORE_ID = "flow.graph";

export type ComputedVariableDependencies =
  | {
      type: "success";
      list: VariableDependencies;
    }
  | {
      type: "error";
      message: string;
    };

export type ComputedTensor =
  | {
      type: "success";
      value: tf.Tensor;
    }
  | {
      type: "error";
      message: string;
    };

const computedByNodeId = <T>(get: (nodeId: NodeId, previous: T | undefined) => T) => {
  const cache = new Map<NodeId, ComputedRef<T>>();
  return (nodeId: NodeId): ComputedRef<T> => {
    if (!cache.has(nodeId)) {
      cache.set(
        nodeId,
        computed(previous => get(nodeId, previous))
      );
    }
    return cache.get(nodeId)!;
  };
};

export const useFlowGraphStore = defineStore(FLOW_GRAPH_STORE_ID, () => {
  const projectSettings = useProjectSettingsStore();
  const evaluateExpressionForVariableDependencies = getExpressionEvaluatorForVariableDependencies();
  const evaluateExpressionForTensor = getExpressionEvaluatorForTensor();

  // --- persisted state

  const nodes = useSessionStorage(`${FLOW_GRAPH_STORE_ID}.nodes`, [] as Node[]);
  const edges = useSessionStorage(`${FLOW_GRAPH_STORE_ID}.edges`, [] as Edge[]);

  // --- computed state

  const computedComputationContext = computed(
    () =>
      ({
        mcRuns: projectSettings.mcRuns
      }) as ComputationContext
  );

  const _nodesByIdMap = computed(() => getNodeByIdMap(nodes.value));
  const _childrenByParentIdMap = computed(() => getChildrenByParentIdMap(nodes.value));
  const _nodeIdByVariableMap = computed(
    () => new Map(nodes.value.map(n => [getComputedVariableName(n.id).value, n.id]))
  );

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

  const getComputedVariableName = computedByNodeId((nodeId: NodeId): string =>
    generateVariableName(getComputedNode(nodeId).value.visualization.title)
  );

  const getComputedVariableDependencies = computedByNodeId((nodeId: NodeId): ComputedVariableDependencies => {
    const node = getComputedNode(nodeId).value;
    if (node.type == OPERATION_NODE_TYPE) {
      try {
        return {
          type: "success",
          list: evaluateExpressionForVariableDependencies(node.options.expression)
        };
      } catch (e) {
        return {
          type: "error",
          message: `${e}`
        };
      }
    }
    return {
      type: "success",
      list: []
    };
  });

  const getComputedTensor = computedByNodeId(
    (nodeId: NodeId, previousTensor: ComputedTensor | undefined): ComputedTensor => {
      if (previousTensor && previousTensor.type == "success") {
        previousTensor.value.dispose();
      }

      try {
        const getNode = (nodeId: string) => getComputedNode(nodeId).value;
        const getVariableDependencies = (nodeId: string) => {
          const computedDependencies = getComputedVariableDependencies(nodeId).value;
          if (computedDependencies.type == "error") throw new Error(computedDependencies.message);
          return computedDependencies.list;
        };
        const getNodeIdForVariable = (variable: string) => {
          const nodeId = _nodeIdByVariableMap.value.get(variable);
          if (!nodeId) throw new Error(`variable '${variable}' unknown`);
          return nodeId;
        };
        const getTensorForNode = (nodeId: string) => {
          const computedTensor = getComputedTensor(nodeId).value;
          if (computedTensor.type == "error") throw new Error(computedTensor.message);
          return computedTensor.value;
        };
        return {
          type: "success",
          value: getTensorForNodeRecursion(
            nodeId,
            getNode,
            getVariableDependencies,
            getNodeIdForVariable,
            evaluateExpressionForTensor,
            getTensorForNode,
            computedComputationContext.value
          )
        };
      } catch (e) {
        return {
          type: "error",
          message: `${e}`
        };
      }
    }
  );

  const getComputedComputationResult = computedByNodeId(async (nodeId: string): Promise<ComputationResult> => {
    const getTensorForNode = (nodeId: string) => {
      const computedTensor = getComputedTensor(nodeId).value;
      if (computedTensor.type == "error") throw new Error(computedTensor.message);
      return computedTensor.value;
    };

    try {
      return {
        type: "value",
        value: await getComputationValueForNode(nodeId, getTensorForNode)
      };
    } catch (e) {
      return {
        type: "error",
        message: `${e}`
      };
    }
  });

  // --- actions

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

  const setEstimateNodeExpressionAction = (nodeId: NodeId, expression: string) => {
    const node = getComputedNode(nodeId).value;
    if (node.type == OPERATION_NODE_TYPE) {
      node.options.expression = expression;
    } else {
      throw new Error(`cannot set expression for node ${node.id} of type ${node.type}`);
    }
  };

  const reset = () => {
    nodes.value = [];
    edges.value = [];
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
    getComputedVariableName,
    getComputedVariableDependencies,
    addEdgeFromVueFlowConnectionAction,
    removeEdgeAction,
    updateNodePositionAction,
    updateNodeSizeAction,
    addNewNodeAction,
    removeNodeAction,
    setEstimateNodeExpressionAction,
    reset
  };
});
