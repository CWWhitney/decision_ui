import { Schema } from "jsonschema";
import { ComputationSettings, ComputationSettingsSchema } from "../compute";
import { EditorSettings, EditorSettingsSchema } from "../editor";
import { Graph, GraphSchema } from "../graph";
import { ModelMetadata, ModelMetadataSchema } from "../metadata";

export interface ModelFile {
    _schema: {
        name: "de.uni-bonn.decision-model/file";
        version: 1;
    };
    metadata: ModelMetadata;
    graph: Graph;
    settings: {
        editor: EditorSettings;
        computation: ComputationSettings;
    };
}

export const SchemaInfoSchema: Schema = {
    type: "object",
    properties: {
        name: { type: "string" },
        version: { type: "integer" }
    }
};

export const SettingsSchema: Schema = {
    type: "object",
    properties: {
        editor: EditorSettingsSchema,
        computation: ComputationSettingsSchema
    },
    required: ["editor", "computation"]
};

export const ModelFileSchema: Schema = {
    type: "object",
    properties: {
        _schema: SchemaInfoSchema,
        metadata: ModelMetadataSchema,
        graph: GraphSchema
    }
};
