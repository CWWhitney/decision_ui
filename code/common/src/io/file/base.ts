import { Schema } from "ajv";

import { Graph, GraphSchema } from "../../graph";
import { MetadataFileState, MetadataFileSchema } from "./metadata";
import { EditorFileSchema, EditorFileState } from "./editor";
import { ComputationFileSchema, ComputationFileState } from "./computation";

export const MODEL_FILE_SCHEMA_NAME = "de.uni-bonn.decision-model/file";
export const MODEL_FILE_VERSION = 3;

export type ModelFileVersion = 3;
export type ModelFileSchemaName = "de.uni-bonn.decision-model/file";

export const ModelFileInfoSchema: Schema = {
    type: "object",
    properties: {
        name: { const: MODEL_FILE_SCHEMA_NAME },
        version: { type: "integer" }
    }
};

export interface ModelFileState {
    _schema: {
        name: ModelFileSchemaName;
        version: ModelFileVersion;
    };
    metadata: MetadataFileState;
    graph: Graph;
    editor: EditorFileState;
    computation: ComputationFileState;
}

export const ModelFileSchema: Schema = {
    type: "object",
    properties: {
        _schema: ModelFileInfoSchema,
        metadata: MetadataFileSchema,
        graph: GraphSchema,
        editor: EditorFileSchema,
        computation: ComputationFileSchema
    }
};

export const GRAPH_FILE_SCHEMA_NAME = "de.uni-bonn.decision-model/graph";
export const GRAPH_FILE_VERSION = 1;

export type GraphFileVersion = 1;
export type GraphFileSchemaName = "de.uni-bonn.decision-model/graph";

export const GraphFileInfoSchema: Schema = {
    type: "object",
    properties: {
        name: { const: GRAPH_FILE_SCHEMA_NAME },
        version: { type: "integer" }
    }
};

export interface GraphFileState {
    _schema: {
        name: GraphFileSchemaName;
        version: GraphFileVersion;
    };
    graph: Graph;
}

export const GraphFileSchema: Schema = {
    type: "object",
    properties: {
        _schema: GraphFileInfoSchema,
        graph: GraphSchema
    }
};
