import { EmptyResponseBody, EmptyResponseSchema, ErrorResponseBody, ErrorResponseSchema } from "./base";
import { Schema } from "ajv";

export const USERNAME_REGEX_PATTERN = "^[a-zA-Z0-9_]+$";

export const UsernameSchema: Schema = {
    type: "string",
    minLength: 3,
    maxLength: 64,
    pattern: USERNAME_REGEX_PATTERN
};

export const PasswordSchema: Schema = { type: "string", minLength: 8, maxLength: 32 };

export interface RegisterRequestBody {
    username: string;
    password: string;
}

export const RegisterRequestSchema: Schema = {
    title: "RegisterRequestSchema",
    type: "object",
    properties: {
        username: UsernameSchema,
        password: PasswordSchema
    },
    required: ["username", "password"],
    additionalProperties: false
};

export type RegisterResponseBody = EmptyResponseBody | ErrorResponseBody;

export const RegisterResponseSchema: Schema = {
    title: "RegisterResponseSchema",
    type: "object",
    oneOf: [EmptyResponseSchema, ErrorResponseSchema]
};

export interface LoginRequestBody {
    username: string;
    password: string;
}

export const LoginRequestSchema: Schema = {
    title: "LoginRequestSchema",
    type: "object",
    properties: {
        username: UsernameSchema,
        password: PasswordSchema
    },
    required: ["username", "password"],
    additionalProperties: false
};

export interface TokenResponseBody {
    accessToken: string;
    refreshToken: string;
}

export const TokenResponseSchema: Schema = {
    title: "TokenResponseSchema",
    type: "object",
    properties: {
        accessToken: { type: "string" },
        refreshToken: { type: "string" }
    },
    required: ["accessToken", "refreshToken"],
    additionalProperties: false
};

export type LoginResponseBody = TokenResponseBody | ErrorResponseBody;

export const LoginResponseSchema: Schema = {
    type: "object",
    oneOf: [TokenResponseSchema, ErrorResponseSchema]
};

export interface RefreshRequestBody {
    refreshToken: string;
}

export const RefreshRequestSchema: Schema = {
    title: "RefreshRequestSchema",
    type: "object",
    properties: {
        refreshToken: { type: "string" }
    },
    required: ["refreshToken"],
    additionalProperties: false
};

export type RefreshResponseBody = TokenResponseBody | ErrorResponseBody;

export const RefreshResponseSchema: Schema = {
    title: "RefreshResponseSchema",
    type: "object",
    oneOf: [TokenResponseSchema, ErrorResponseSchema]
};

export interface LogoutRequestBody {
    refreshToken: string;
}

export const LogoutRequestSchema: Schema = {
    title: "LogoutRequestSchema",
    type: "object",
    properties: {
        refreshToken: { type: "string" }
    },
    required: ["refreshToken"],
    additionalProperties: false
};

export type LogoutResponseBody = EmptyResponseBody | ErrorResponseBody;

export const LogoutResponseSchema: Schema = {
    title: "LogoutResponseSchema",
    type: "object",
    oneOf: [EmptyResponseSchema, ErrorResponseSchema]
};
