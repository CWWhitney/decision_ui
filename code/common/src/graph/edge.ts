import { NodeId } from "./node";

export type EdgeId = string;

export interface Edge {
  id: EdgeId;
  source: NodeId;
  target: NodeId;
}

export const getEdgeIdForNodes = (source: NodeId, target: NodeId): EdgeId => {
  return `${source}-${target}`;
};
