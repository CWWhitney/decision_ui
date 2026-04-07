import { Schema } from "ajv";

export interface FrontendComputationState {
    mcRuns: number;
    histogramBins: number;
    gpuAcceleration: boolean;
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

export interface BackendResultHistogramComputationState {
    mcRuns: number;
    histogramBins: number;
    maxRuntime: number;
}

export const BackendResultHistogramComputationSchema: Schema = {
    type: "object",
    properties: {
        mcRuns: { type: "number" },
        histogramBins: { type: "number" },
        maxRuntime: { type: "number" }
    },
    required: ["mcRuns", "histogramBins", "maxRuntime"]
};

export interface BackendEvpiComputationState {
    mcRuns: number;
    maxRuntime: number;
}

export const BackendEvpiComputationSchema: Schema = {
    type: "object",
    properties: {
        mcRuns: { type: "number" },
        maxRuntime: { type: "number" }
    },
    required: ["mcRuns", "maxRuntime"]
};

export interface BackendComputationState {
    resultHistogram: BackendResultHistogramComputationState;
    evpi: BackendEvpiComputationState;
}

export const BackendComputationSchema: Schema = {
    type: "object",
    properties: {
        resultHistogram: BackendResultHistogramComputationSchema,
        evpi: BackendEvpiComputationSchema
    },
    required: ["resultHistogram", "evpi"]
};

export interface ComputationFileState {
    frontend: FrontendComputationState;
    backend: BackendComputationState;
}

export const ComputationFileSchema: Schema = {
    type: "object",
    properties: {
        frontend: FrontendComputationSchema,
        backend: BackendComputationSchema
    },
    required: ["frontend", "backend"]
};
