import { Schema } from "ajv";

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

export const getCenterPosition = (positions: Position[]): Position => {
    return {
        x: positions.reduce((p, position) => p + position.x, 0) / positions.length,
        y: positions.reduce((p, position) => p + position.y, 0) / positions.length
    } as Position;
};
