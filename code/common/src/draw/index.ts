import { Schema } from "jsonschema";

export interface Position {
    x: number;
    y: number;
}

export const PositionSchema: Schema = {
    type: "object",
    properties: {
        x: { type: "number" },
        y: { type: "number" }
    },
    required: ["x", "y"]
};

export interface Size {
    width: number;
    height: number;
}

export const SizeSchema: Schema = {
    type: "object",
    properties: {
        width: { type: "number" },
        height: { type: "number" }
    },
    required: ["width", "height"]
};
