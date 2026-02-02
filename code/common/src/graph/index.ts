import { Edge } from "./edge";
import { Node } from "./node";

export * from "./node";
export * from "./edge";

export interface Graph {
    nodes: Node[];
    edges: Edge[];
}
