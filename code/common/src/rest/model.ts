import { Schema } from "ajv";
import { ModelFileSchema, ModelFileState } from "../io";
import { EmptyOrErrorResponseBody, EmptyOrErrorResponseSchema, ErrorResponseBody, ErrorResponseSchema } from "./base";

export interface ListModelsEntry {
    id: number;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export type ListModelsResponseBody = { models: ListModelsEntry[] } | ErrorResponseBody;

export const ListModelsResponseSchema: Schema = {
    title: "ListModelsResponseSchema",
    type: "object",
    oneOf: [
        {
            type: "object",
            properties: {
                models: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "integer" },
                            name: { type: "string" },
                            description: { type: "string" },
                            createdAt: { type: "string" },
                            updatedAt: { type: "string" }
                        },
                        required: ["id", "name", "description", "createdAt", "updatedAt"],
                        additionalProperties: false
                    }
                }
            },
            required: ["models"],
            additionalProperties: false
        },
        ErrorResponseSchema
    ]
};

export type GetModelResponseBody =
    | {
          id: number;
          modelfile: ModelFileState;
      }
    | ErrorResponseBody;

export const GetModelResponseSchema: Schema = {
    title: "GetModelResponseSchema",
    type: "object",
    oneOf: [
        {
            type: "object",
            properties: {
                id: { type: "integer" },
                modelfile: ModelFileSchema
            },
            required: ["id", "modelfile"],
            additionalProperties: false
        },
        ErrorResponseSchema
    ]
};

export interface AddModelRequestBody {
    modelfile: ModelFileState;
}

export const AddModelRequestSchema: Schema = {
    title: "AddModelRequestSchema",
    type: "object",
    properties: {
        modelfile: ModelFileSchema
    },
    required: ["modelfile"],
    additionalProperties: false
};

export type AddModelResponseBody = { modelId: number } | ErrorResponseBody;
export const AddModelResponseSchema: Schema = {
    title: "AddModelResponseSchema",
    type: "object",
    oneOf: [
        {
            type: "object",
            properties: {
                modelId: { type: "integer" }
            },
            required: ["modelId"],
            additionalProperties: false
        },
        ErrorResponseSchema
    ]
};

export interface UpdateModelRequestBody {
    modelfile: ModelFileState;
}

export const UpdateModelRequestSchema: Schema = {
    title: "UpdateModelRequestSchema",
    type: "object",
    properties: {
        modelfile: ModelFileSchema
    },
    required: ["modelfile"],
    additionalProperties: false
};

export type UpdateModelResponseBody = EmptyOrErrorResponseBody;
export const UpdateModelResponseSchema = EmptyOrErrorResponseSchema;

export type DeleteModelResponseBody = EmptyOrErrorResponseBody;
export const DeleteModelResponseSchema = EmptyOrErrorResponseSchema;
