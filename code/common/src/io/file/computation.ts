import { Schema } from "ajv";

export interface FrontendComputationState {
    mcRuns: number;
    histogramBins: number;
    gpuAcceleration: boolean;
}

export interface BackendComputationState {
    mcRuns: number;
    histogramBins: number;
}

export interface ComputationFileState {
    frontend: FrontendComputationState;
    backend: BackendComputationState;
}

export const FrontendComputationSchema: Schema = {
    type: "object",
    properties: {
        mcRuns: { type: "number" },
        histogramBins: { type: "number" },
        gpuAcceleration: { type: "boolean" }
    },
    required: ["mcRuns", "histogramBins", "gpuAcceleration"]
};

export const BackendComputationSchema: Schema = {
    type: "object",
    properties: {
        mcRuns: { type: "number" },
        histogramBins: { type: "number" }
    },
    required: ["mcRuns", "histogramBins"]
};

export const ComputationFileSchema: Schema = {
    type: "object",
    properties: {
        frontend: FrontendComputationSchema,
        backend: BackendComputationSchema
    },
    required: ["frontend", "backend"]
};
