import { getHandlePositions } from "@/common/layout";
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

interface Node {
  id: string;
  position: XYPosition;
  dimensions: Dimensions;
  title: string;
}

interface Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

interface FlowState {
  nodes: Node[];
  edges: Edge[];
}

const initializeFlowState = (): FlowState => {
  return {
    nodes: [] as Node[],
    edges: [] as Edge[]
  };
};

const findNode = (nodeId: string, nodes: Node[]) => {
  for (const node of nodes) {
    if (nodeId == node.id) {
      return node;
    }
  }

  throw new Error(`node with id ${nodeId} not found`);
};

export const useFlowStore = defineStore("flow", {
  state: (): RemovableRef<FlowState> => useSessionStorage("flow", initializeFlowState()),
  getters: {
    getVueFlowNodes: state => {
      return state.nodes.map(
        node =>
          ({
            id: node.id,
            position: node.position,
            type: "custom",
            width: node.dimensions.width,
            height: node.dimensions.height,
            data: {
              label: node.title
            }
          }) as VueFlowNode
      );
    },
    getVueFlowEdges: state => {
      return state.edges.map(edge => {
        const sourceNode = findNode(edge.source, state.nodes);
        const targetNode = findNode(edge.target, state.nodes);

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
    }
  },
  actions: {
    reset() {
      Object.assign(this, initializeFlowState());
    },
    addVueFlowConnection(connection: VueFlowConnection) {
      const edge_id = `${connection.source}-${connection.target}`;
      this.edges = this.edges.filter(e => e.id != edge_id);
      this.edges.push({
        ...connection,
        id: edge_id
      });
    },
    removeEdge(edge_id: string) {
      this.edges = this.edges.filter(e => e.id != edge_id);
    },
    updateNodePosition(node_id: string, node_position: XYPosition) {
      for (const node of this.nodes) {
        if (node.id == node_id) {
          node.position = node_position;
          break;
        }
      }
    },
    updateNodeDimensions(node_id: string, node_dimensions: Dimensions) {
      for (const node of this.nodes) {
        if (node.id == node_id) {
          node.dimensions = node_dimensions;
          break;
        }
      }
    },
    addNode() {
      const uniqueId = (this.nodes as Node[]).reduce((i: number, node) => Math.max(parseInt(node.id) ?? 0, i), 0) + 1;
      this.nodes.push({
        id: `${uniqueId}`,
        position: { x: 250, y: 5 },
        title: `Node ${uniqueId}`,
        dimensions: { width: 200, height: 50 }
      });
    },
    removeNode(node_id: string) {
      this.nodes = this.nodes.filter(n => n.id != node_id);
    }
  }
});
