export const VARIABLE_NODE_TYPE = "variable";
export const COLLECTION_NODE_TYPE = "collection";
export const SUBGRAPH_NODE_TYPE = "subgraph";

export type VariableNodeType = "variable";
export type CollectionNodeType = "collection";
export type SubgraphNodeType = "subgraph";

export type NodeType = VariableNodeType | CollectionNodeType | SubgraphNodeType;

export const AVAILABLE_NODE_TYPES: NodeType[] = [VARIABLE_NODE_TYPE, COLLECTION_NODE_TYPE, SUBGRAPH_NODE_TYPE];
