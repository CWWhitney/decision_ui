import { Schema } from "ajv";

export interface ErrorResponseBody {
    error: string;
}

export const ErrorResponseSchema: Schema = {
    title: "rrorResponseSchema",
    type: "object",
    properties: {
        error: { type: "string" }
    },
    required: ["error"],
    additionalProperties: false
};

export const makeErrorResponseBody = (error: string) => ({
    error
});

export type EmptyResponseBody = object;

export const EmptyResponseSchema: Schema = {
    title: "EmptyResponseSchema",
    type: "object",
    additionalProperties: false
};

export type EmptyOrErrorResponseBody = EmptyResponseBody | ErrorResponseBody;

export const EmptyOrErrorResponseSchema: Schema = {
    title: "EmptyOrErrorResponseSchema",
    type: "object",
    oneOf: [ErrorResponseSchema, EmptyResponseSchema]
};
