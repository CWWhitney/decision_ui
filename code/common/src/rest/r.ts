import { Schema } from "ajv";
import { Graph, GraphSchema } from "../graph";
import {
    BackendEvpiComputationSchema,
    BackendEvpiComputationState,
    BackendResultHistogramComputationSchema,
    BackendResultHistogramComputationState
} from "../io";
import { ErrorResponseBody, ErrorResponseSchema } from "./base";

export interface CalculateResultHistogramRequestBody {
    graph: Graph;
    computation: BackendResultHistogramComputationState;
}

export const CalculateResultHistogramRequestSchema: Schema = {
    title: "CalculateResultHistogramRequestSchema",
    type: "object",
    properties: {
        graph: GraphSchema,
        computation: BackendResultHistogramComputationSchema
    },
    required: ["graph", "computation"],
    additionalProperties: false
};

export interface RExecutionError {
    reason: string;
    stdout: string;
    stderr: string;
    exitcode: number;
}

export const RExcecutionErrorSchema: Schema = {
    title: "RExcecutionErrorSchema",
    type: "object",
    properties: {
        reason: { type: "string" },
        stdout: { type: "string" },
        stderr: { type: "string" },
        exitcode: { oneOf: [{ type: "integer" }, { type: "null" }] }
    },
    required: ["reason", "stdout", "stderr", "exitcode"],
    additionalProperties: false
};

export interface CalculateResultHistogramData {
    bins: number[];
    counts: number[][];
    variables: string[];
}

export const CalculateResultHistogramDataSchema: Schema = {
    type: "object",
    properties: {
        bins: { type: "array", items: { type: "number" } },
        counts: { type: "array", items: { type: "array", items: { type: "number" } } },
        variables: { type: "array", items: { type: "string" } }
    },
    required: ["bins", "counts", "variables"],
    additionalProperties: false
};

export interface CalculateResultHistogramResult {
    data: CalculateResultHistogramData | null;
    error: RExecutionError;
}

export type CalculateResultHistogramResponseBody = CalculateResultHistogramResult | ErrorResponseBody;

export const CalculateResultHistogramResponseSchema: Schema = {
    title: "CalculateResultHistogramResponseSchema",
    type: "object",
    oneOf: [
        {
            type: "object",
            properties: {
                data: CalculateResultHistogramDataSchema,
                error: { type: "null" }
            },
            required: ["data", "error"],
            additionalProperties: false
        },
        {
            type: "object",
            properties: {
                data: { type: "null" },
                error: RExcecutionErrorSchema
            },
            required: ["data", "error"],
            additionalProperties: false
        },
        ErrorResponseSchema
    ]
};

export interface CalculateEvpiRequestBody {
    graph: Graph;
    computation: BackendEvpiComputationState;
}

export const CalculateEvpiRequestSchema: Schema = {
    title: "CalculateEvpiRequestSchema",
    type: "object",
    properties: {
        graph: GraphSchema,
        computation: BackendEvpiComputationSchema
    },
    required: ["graph", "computation"],
    additionalProperties: false
};

export interface CalculateEvpiData {
    [estimateVariable: string]: {
        [resultVariable: string]: number;
    };
}

export const CalculateEvpiDataSchema: Schema = {
    type: "object",
    patternProperties: {
        "^.*$": {
            type: "object",
            patternProperties: {
                "^.*$": { type: "number" }
            }
        }
    }
};

export interface CalculateEvpiResult {
    data: CalculateEvpiData | null;
    error: RExecutionError;
}

export type CalculateEvpiResponseBody = CalculateEvpiResult | ErrorResponseBody;

export const CalculateEvpiResponseSchema: Schema = {
    title: "CalculateEvpiResponseSchema",
    type: "object",
    oneOf: [
        {
            type: "object",
            properties: {
                data: CalculateEvpiDataSchema,
                error: { type: "null" }
            },
            required: ["data", "error"],
            additionalProperties: false
        },
        {
            type: "object",
            properties: {
                data: { type: "null" },
                error: RExcecutionErrorSchema
            },
            required: ["data", "error"],
            additionalProperties: false
        },
        ErrorResponseSchema
    ]
};
