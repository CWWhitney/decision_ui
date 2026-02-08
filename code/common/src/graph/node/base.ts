import { Schema } from "jsonschema";

import { Position, PositionSchema, Size, SizeSchema } from "../../editor/layout";
import {
    EmptyNodeFunctionSchema,
    EmptyNodeFunctionState,
    NodeFunctionState,
    NodeVariableFunctionSchema,
    VariableNodeFunctionState
} from "./function";
import {
    CollectionNodeStyleState,
    NodeStyleSchema,
    NodeStyleState,
    SubgraphNodeStyleState,
    VariableNodeStyleState
} from "./style";
import {
    AVAILABLE_NODE_TYPES,
    COLLECTION_NODE_TYPE,
    CollectionNodeType,
    SUBGRAPH_NODE_TYPE,
    SubgraphNodeType,
    VARIABLE_NODE_TYPE,
    VariableNodeType
} from "./type";

export type NodeId = string;
export type SubgraphId = NodeId;

export interface AbstractNode<T, F extends NodeFunctionState, S extends NodeStyleState> {
    id: NodeId;
    type: T;
    nodeParentId: NodeId | null;
    subgraphParentId: SubgraphId | null;

    function: F;

    visualization: {
        title: string;
        position: Position;
        size: Size;
        style: S;
        autoConnect: boolean;
    };
}

export type VariableNode = AbstractNode<VariableNodeType, VariableNodeFunctionState, VariableNodeStyleState>;
export type CollectionNode = AbstractNode<CollectionNodeType, EmptyNodeFunctionState, CollectionNodeStyleState>;
export type SugraphNode = AbstractNode<SubgraphNodeType, EmptyNodeFunctionState, SubgraphNodeStyleState>;

export type Node = VariableNode | CollectionNode | SugraphNode;

export const NodeVisualizationSchema: Schema = {
    type: "object",
    properties: {
        title: { type: "string" },
        position: PositionSchema,
        size: SizeSchema,
        style: NodeStyleSchema,
        autoConnect: { type: "boolean" }
    },
    required: ["title", "position", "size", "style", "autoConnect"]
};

export const NodeSchema: Schema = {
    type: "object",
    properties: {
        id: { type: "string" },
        type: { enum: AVAILABLE_NODE_TYPES },
        nodeParentId: { type: ["string", "null"] },
        subgraphParentId: { type: ["string", "null"] },
        visualization: NodeVisualizationSchema
    },
    required: ["id", "type", "nodeParentId", "subgraphParentId", "visualization"],
    allOf: [
        {
            if: {
                properties: { type: { const: VARIABLE_NODE_TYPE } }
            },
            then: {
                properties: {
                    function: NodeVariableFunctionSchema
                },
                required: ["function"]
            }
        },
        {
            if: {
                properties: { type: { enum: [COLLECTION_NODE_TYPE, SUBGRAPH_NODE_TYPE] } }
            },
            then: {
                properties: {
                    function: EmptyNodeFunctionSchema
                },
                required: ["function"]
            }
        }
    ]
};
