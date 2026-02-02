export const VARIABLE_NODE_TYPE = "variable";
export const COLLECTION_NODE_TYPE = "collection";

export type VariableNodeType = "variable";
export type CollectionNodeType = "collection";

export type NodeType = VariableNodeType | CollectionNodeType;

export const AVAILABLE_NODE_TYPES: NodeType[] = [VARIABLE_NODE_TYPE, COLLECTION_NODE_TYPE];
