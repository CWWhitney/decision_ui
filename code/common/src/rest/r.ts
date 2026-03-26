import { Schema } from "ajv";
import { Graph, GraphSchema } from "../graph";
import { BackendComputationSchema, BackendComputationState } from "../io";
import { ErrorResponseBody, ErrorResponseSchema } from "./base";

export interface CalculateResultHistogramRequestBody {
    graph: Graph;
    computation: BackendComputationState;
}

export const CalculateResultHistogramRequestSchema: Schema = {
    title: "CalculateResultHistogramRequestSchema",
    type: "object",
    properties: {
        graph: GraphSchema,
        computation: BackendComputationSchema
    },
    required: ["graph", "computation"],
    additionalProperties: false
};

export interface RExecutionState {
    stdout: string;
    stderr: string;
    exitcode: number;
}

export const RExcecutionSchema: Schema = {
    title: "RExcecutionSchema",
    type: "object",
    properties: {
        stdout: { type: "string" },
        stderr: { type: "string" },
        exitcode: { type: "integer" }
    },
    required: ["stdout", "stderr", "exitcode"],
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
    data: CalculateResultHistogramData;
    execution: RExecutionState;
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
                execution: RExcecutionSchema
            },
            required: ["data", "execution"],
            additionalProperties: false
        },
        ErrorResponseSchema
    ]
};
