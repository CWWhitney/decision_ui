import { getHandlePositions } from "@/common/layout";
import type { AvailableDistributionsType } from "@/editor/distributions";
import {
  type XYPosition,
  type Node as VueFlowNode,
  type Edge as VueFlowEdge,
  MarkerType,
  type Connection as VueFlowConnection,
  type Dimensions
} from "@vue-flow/core";
import { useSessionStorage, type RemovableRef } from "@vueuse/core";
import { defineStore } from "pinia";

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
  type: "estimate";
  estimate: EstimateDefinitionState;
}

export interface OperationNodeState extends BaseNodeState {
  type: "operation";
  operation: OperationDefinitionState;
}

export interface ResultNodeState extends BaseNodeState {
  type: "result";
  results: ResultsDefinitionState;
}

export type NodeTypes = "estimate" | "operation" | "result";
export const AVAILABLE_NODE_TYPES: NodeTypes[] = ["estimate", "operation", "result"];
export const DEFAULT_NODE_TYPE_TITLES: { [key in NodeTypes]: string } = {
  estimate: "Estimate",
  operation: "Operation",
  result: "Result"
};

export interface BaseNodeState {
  id: string;
  type: NodeTypes;
  position: XYPosition;
  dimensions: Dimensions;
  title: string;
  parentNodeId: string | null;
}

export type NodeState = ResultNodeState | OperationNodeState | EstimateNodeState;

export interface EdgeState {
  id: string;
  source: string;
  target: string;
}

export type EdgeType = "smooth-step" | "bezier" | "straight";
export const AVAILABLE_EDGE_TYPES = ["smooth-step", "bezier", "straight"] as EdgeType[];

export interface GraphStyle {
  edgeType: EdgeType;
}

export interface GraphState {
  nodes: NodeState[];
  edges: EdgeState[];
  style: GraphStyle;
}

export interface NodeEditDialogState {
  open: boolean;
  node: NodeState | null;
}

export interface DialogsState {
  nodeEdit: NodeEditDialogState;
}

export interface ModelState {
  graph: GraphState;
  dialogs: DialogsState;
}

const initializeModelState = (): ModelState => {
  return {
    graph: {
      nodes: [] as NodeState[],
      edges: [] as EdgeState[],
      style: {
        edgeType: "smooth-step"
      }
    },
    dialogs: {
      nodeEdit: {
        open: false,
        node: null
      }
    }
  };
};

const findNode = (nodeId: string, nodes: NodeState[]) => {
  for (const node of nodes) {
    if (nodeId == node.id) {
      return node;
    }
  }

  throw new Error(`node with id ${nodeId} not found`);
};

const nextNodeId = (nodes: NodeState[]) => {
  return nodes.reduce((i: number, node) => Math.max(parseInt(node.id) ?? 0, i), 0) + 1;
};

export const useFlowStore = defineStore("flow", {
  state: (): RemovableRef<ModelState> => useSessionStorage("flow", initializeModelState()),
  getters: {
    getVueFlowNodes: state => {
      return state.graph.nodes.map(
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
    },
    getVueFlowEdges: state => {
      return state.graph.edges.map(edge => {
        const sourceNode = findNode(edge.source, state.graph.nodes);
        const targetNode = findNode(edge.target, state.graph.nodes);

        const [sourceHandle, targetHandle] = getHandlePositions(sourceNode?.position, targetNode?.position);

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
    },
    getNode: state => {
      return (nodeId: string) => findNode(nodeId, state.graph.nodes);
    }
  },
  actions: {
    reset() {
      Object.assign(this, initializeModelState());
    },
    addEdgeFromVueFlowConnection(connection: VueFlowConnection) {
      const edge_id = `${connection.source}-${connection.target}`;
      this.graph.edges = this.graph.edges.filter(e => e.id != edge_id);
      this.graph.edges.push({
        ...connection,
        id: edge_id
      });
    },
    removeEdge(edge_id: string) {
      this.graph.edges = this.graph.edges.filter(e => e.id != edge_id);
    },
    updateNodePosition(node_id: string, node_position: XYPosition) {
      for (const node of this.graph.nodes) {
        if (node.id == node_id) {
          node.position = node_position;
          break;
        }
      }
    },
    updateNodeDimensions(node_id: string, node_dimensions: Dimensions) {
      for (const node of this.graph.nodes) {
        if (node.id == node_id) {
          node.dimensions = node_dimensions;
          break;
        }
      }
    },
    addNode(
      nodeType: NodeTypes,
      params?: { parentNodeId?: string | null; position?: XYPosition | null; dimensions?: Dimensions | null }
    ) {
      const uniqueId = nextNodeId(this.graph.nodes);
      const baseNodeState = {
        id: `${uniqueId}`,
        title: `${DEFAULT_NODE_TYPE_TITLES[nodeType]} ${uniqueId}`,
        position: params?.position ?? { x: 0, y: 0 },
        dimensions: params?.dimensions ?? { width: 200, height: 50 },
        parentNodeId: params?.parentNodeId ?? null
      };

      if (nodeType == "estimate") {
        this.graph.nodes.push({
          ...baseNodeState,
          type: nodeType,
          estimate: {
            distribution: "deterministic",
            lower: 1,
            upper: 1,
            comment: ""
          }
        });
      } else if (nodeType == "operation") {
        this.graph.nodes.push({
          ...baseNodeState,
          type: nodeType,
          operation: {
            expression: ""
          }
        });
      } else if (nodeType == "result") {
        this.graph.nodes.push({
          ...baseNodeState,
          type: nodeType,
          results: {
            variables: [],
            colors: []
          }
        });
      }
    },
    removeNode(node_id: string) {
      this.graph.nodes = this.graph.nodes.filter(n => n.id != node_id);
    },
    switchEdgeType() {
      const nextIdx = (AVAILABLE_EDGE_TYPES.indexOf(this.graph.style.edgeType) + 1) % AVAILABLE_EDGE_TYPES.length;
      this.graph.style.edgeType = AVAILABLE_EDGE_TYPES[nextIdx] ?? "smooth-step";
    },
    openNodeEditDialog(nodeId: string) {
      const node = findNode(nodeId, this.graph.nodes);
      if (node) {
        this.dialogs.nodeEdit.open = true;
        this.dialogs.nodeEdit.node = node;
      }
    },
    closeNodeEditDialog() {
      this.dialogs.nodeEdit.open = false;
      this.dialogs.nodeEdit.node = null;
    }
  }
});
