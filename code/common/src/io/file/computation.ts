import { Schema } from "ajv";

export interface ComputationFileState {
    mcRuns: number;
    histogramBins: number;
    gpuAcceleration: boolean;
}

export const ComputationFileSchema: Schema = {
    type: "object",
    properties: {
        mcRuns: { type: "number" },
        histogramBins: { type: "number" },
        gpuAcceleration: { type: "boolean" }
    },
    required: ["mcRuns", "histogramBins", "gpuAcceleration"]
};
