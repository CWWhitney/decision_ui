export * from "./editor";
export * from "./computation";
export * from "./metadata";

import { Schema } from "jsonschema";

import { Graph, GraphSchema } from "../../graph";
import { MetadataFileState, MetadataFileSchema } from "./metadata";
import { EditorFileSchema, EditorFileState } from "./editor";
import { ComputationFileSchema, ComputationFileState } from "./computation";

export const SchemaInfoSchema: Schema = {
    type: "object",
    properties: {
        name: { type: "string" },
        version: { type: "integer" }
    }
};

export interface ModelFileState {
    _schema: {
        name: "de.uni-bonn.decision-model/file";
        version: 1;
    };
    metadata: MetadataFileState;
    graph: Graph;
    editor: EditorFileState;
    computation: ComputationFileState;
}

export const ModelFileSchema: Schema = {
    type: "object",
    properties: {
        _schema: SchemaInfoSchema,
        metadata: MetadataFileSchema,
        graph: GraphSchema,
        editor: EditorFileSchema,
        computation: ComputationFileSchema
    }
};
