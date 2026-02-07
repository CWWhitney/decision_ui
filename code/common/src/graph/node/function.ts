import { Schema } from "jsonschema";
import { DISTRIBUTION_TYPES, DistributionType } from "../../compute";

export const ESTIMATE_FUNCTION_TYPE = "estimate";
export const OPERATION_FUNCTION_TYPE = "operation";
export const LOOP_FUNCTION_TYPE = "loop";
export const RESULT_FUNCTION_TYPE = "result";
export const EMPTY_FUNCTION_TYPE = "empty";

export type EstimateFunctionType = "estimate";
export type OperationFunctionType = "operation";
export type LoopFunctionType = "loop";
export type ResultFunctionType = "result";
export type EmptyFunctionType = "empty";

export type NodeFunctionType =
    | EstimateFunctionType
    | OperationFunctionType
    | LoopFunctionType
    | ResultFunctionType
    | EmptyFunctionType;

export const AVAILABLE_NODE_FUNCTION_TYPES: NodeFunctionType[] = [
    ESTIMATE_FUNCTION_TYPE,
    OPERATION_FUNCTION_TYPE,
    LOOP_FUNCTION_TYPE,
    RESULT_FUNCTION_TYPE
];

// node function state

export interface AbstractNodeFunctionState<T extends NodeFunctionType> {
    type: T;
}

export interface AbstractVariableNodeFunctionState<T extends NodeFunctionType> extends AbstractNodeFunctionState<T> {
    variable: string;
}

export interface EstimateNodeFunctionState extends AbstractVariableNodeFunctionState<EstimateFunctionType> {
    distribution: DistributionType;
    lower: number;
    upper: number;
    comment: string;
}

export const EstimateNodeFunctionSchema: Schema = {
    type: "object",
    properties: {
        distribution: { enum: DISTRIBUTION_TYPES },
        lower: { type: "number" },
        upper: { type: "number" },
        comment: { type: "string" }
    },
    required: ["distribution", "lower", "upper", "comment"]
};

export interface OperationNodeFunctionState extends AbstractVariableNodeFunctionState<OperationFunctionType> {
    expression: string;
}

export const OperationNodeFunctionSchema: Schema = {
    type: "object",
    properties: {
        expression: { type: "string" }
    },
    required: ["expression"]
};

export interface LoopNodeFunctionState extends AbstractVariableNodeFunctionState<LoopFunctionType> {
    iterationsExpression: string;
    initExpression: string;
    loopExpression: string;
}

export const LoopNodeFunctionSchema: Schema = {
    type: "object",
    properties: {
        iterationsExpression: { type: "string" },
        initExpression: { type: "string" },
        loopExpression: { type: "string" }
    },
    required: ["iterationsExpression", "initExpression", "loopExpression"]
};

export interface ResultNodeFunctionState extends AbstractVariableNodeFunctionState<ResultFunctionType> {
    expression: string;
}

export const ResultNodeFunctionSchema: Schema = {
    type: "object",
    properties: {
        expression: { type: "string" }
    },
    required: ["expression"]
};

export type EmptyNodeFunctionState = AbstractNodeFunctionState<EmptyFunctionType>;

export const EmptyNodeFunctionSchema: Schema = {
    type: "object"
};

export type VariableNodeFunctionState =
    | EstimateNodeFunctionState
    | OperationNodeFunctionState
    | LoopNodeFunctionState
    | ResultNodeFunctionState;

export type NodeFunctionState = VariableNodeFunctionState | EmptyNodeFunctionState;

export const NodeVariableFunctionSchema: Schema = {
    type: "object",
    properties: {
        type: { enum: AVAILABLE_NODE_FUNCTION_TYPES },
        variable: { type: "string" }
    },
    required: ["type", "variable"],
    allOf: [
        {
            if: {
                properties: { type: { const: ESTIMATE_FUNCTION_TYPE } }
            },
            then: EstimateNodeFunctionSchema
        },
        {
            if: {
                properties: { type: { const: OPERATION_FUNCTION_TYPE } }
            },
            then: OperationNodeFunctionSchema
        },
        {
            if: {
                properties: { type: { const: LOOP_FUNCTION_TYPE } }
            },
            then: LoopNodeFunctionSchema
        },
        {
            if: {
                properties: { type: { const: RESULT_FUNCTION_TYPE } }
            },
            then: ResultNodeFunctionSchema
        }
    ]
};
