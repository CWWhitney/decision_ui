import { Schema } from "ajv";
import {
    AVAILABLE_EDGE_STYLE_TYPES,
    AVAILABLE_EDITOR_BACKGROUNDS,
    EdgeStyleType,
    EditorBackground
} from "../../editor";

export interface EditorFileState {
    edgeStyle: EdgeStyleType;
    background: EditorBackground;
    locked: boolean;
    snapToGrid: boolean;
    autoAddComputationEdges: boolean;
    autosave: boolean;
}

export const EditorFileSchema: Schema = {
    type: "object",
    properties: {
        edgeStyle: { enum: AVAILABLE_EDGE_STYLE_TYPES },
        background: { enum: AVAILABLE_EDITOR_BACKGROUNDS },
        locked: { type: "boolean" },
        snapToGrid: { type: "boolean" },
        autoAddComputationEdges: { type: "boolean" },
        autosave: { type: "boolean" }
    },
    required: ["edgeStyle", "background", "locked", "snapToGrid", "autoAddComputationEdges", "autosave"]
};
