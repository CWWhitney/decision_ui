import { Schema } from "jsonschema";
import { Edge, EdgeSchema } from "./edge";
import { Node, NodeSchema } from "./node";

export interface Graph {
    nodes: Node[];
    edges: Edge[];
}

export const GraphSchema: Schema = {
    type: "object",
    properties: {
        nodes: { type: "array", items: NodeSchema },
        edges: { type: "array", items: EdgeSchema }
    },
    required: ["nodes", "edges"]
};
