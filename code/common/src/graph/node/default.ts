// default state helper

import { NORMAL_DISTRIBUTION_TYPE } from "../../compute";
import { Size } from "../../editor/layout";
import {
    EMPTY_FUNCTION_TYPE,
    EmptyNodeFunctionState,
    ESTIMATE_FUNCTION_TYPE,
    EstimateNodeFunctionState,
    LOOP_FUNCTION_TYPE,
    LoopNodeFunctionState,
    NodeFunctionState,
    NodeFunctionType,
    OPERATION_FUNCTION_TYPE,
    OperationNodeFunctionState,
    RESULT_FUNCTION_TYPE,
    ResultNodeFunctionState,
    VariableNodeFunctionState,
    VariableNodeFunctionType
} from "./function";
import {
    AbstractNodeStyleState,
    BENEFIT_STYLE_TYPE,
    BenefitStyleType,
    COLLECTION_STYLE_TYPE,
    CollectionNodePresetStyleState,
    COST_STYLE_TYPE,
    CostStyleType,
    CUSTOM_STYLE_TYPE,
    CustomNodeStyleState,
    GENERIC_STYLE_TYPE,
    GenericStyleType,
    NODE_STYLE_BORDER_SOLID,
    NODE_STYLE_BOX_SHAPE,
    NodeStyleType,
    RESULT_STYLE_TYPE,
    ResultStyleType,
    RISK_STYLE_TYPE,
    RiskStyleType
} from "./style";
import { COLLECTION_NODE_TYPE, NodeType, SUBGRAPH_NODE_TYPE, VARIABLE_NODE_TYPE } from "./type";

export const getDefaultNodeSize = (nodeType: NodeType): Size => {
    switch (nodeType) {
        case VARIABLE_NODE_TYPE:
        case SUBGRAPH_NODE_TYPE:
            return { width: 200, height: 50 };
        case COLLECTION_NODE_TYPE:
            return { width: 500, height: 400 };
        default:
            throw new Error(`unknown node type '${nodeType}'`);
    }
};

export const getDefaultFunctionState = (variable: string, functionType: NodeFunctionType): NodeFunctionState => {
    switch (functionType) {
        case ESTIMATE_FUNCTION_TYPE:
            return {
                type: ESTIMATE_FUNCTION_TYPE,
                variable,
                unit: "",
                distribution: NORMAL_DISTRIBUTION_TYPE,
                lower: -1,
                upper: 1,
                comment: "",
                isModifiable: true,
                lowerBounds: [-2, 0],
                upperBounds: [0, 2],
                rangeStep: 0.1
            } as EstimateNodeFunctionState;
        case OPERATION_FUNCTION_TYPE:
            return {
                type: OPERATION_FUNCTION_TYPE,
                variable,
                unit: "",
                expression: ""
            } as OperationNodeFunctionState;
        case LOOP_FUNCTION_TYPE:
            return {
                type: LOOP_FUNCTION_TYPE,
                variable,
                unit: "",
                iterationsExpression: "10",
                initExpression: "",
                loopExpression: ""
            } as LoopNodeFunctionState;
        case RESULT_FUNCTION_TYPE:
            return {
                type: RESULT_FUNCTION_TYPE,
                unit: "",
                variable,
                expression: ""
            } as ResultNodeFunctionState;
        case EMPTY_FUNCTION_TYPE:
            return {
                type: EMPTY_FUNCTION_TYPE
            } as EmptyNodeFunctionState;
        default:
            throw new Error(`unkown node function type '${functionType}'`);
    }
};

export const transitionFunctionState = (
    previous: VariableNodeFunctionState,
    newFunctionType: VariableNodeFunctionType
) => {
    const newSimpleExpression =
        previous.type == OPERATION_FUNCTION_TYPE || previous.type == RESULT_FUNCTION_TYPE ? previous.expression : "";

    switch (newFunctionType) {
        case ESTIMATE_FUNCTION_TYPE:
            return {
                ...getDefaultFunctionState(previous.variable, newFunctionType),
                unit: previous.unit
            } as EstimateNodeFunctionState;
        case OPERATION_FUNCTION_TYPE:
            return {
                ...getDefaultFunctionState(previous.variable, newFunctionType),
                unit: previous.unit,
                expression: newSimpleExpression
            } as OperationNodeFunctionState;
        case LOOP_FUNCTION_TYPE:
            return {
                ...getDefaultFunctionState(previous.variable, newFunctionType),
                unit: previous.unit
            } as LoopNodeFunctionState;
        case RESULT_FUNCTION_TYPE:
            return {
                ...getDefaultFunctionState(previous.variable, newFunctionType),
                unit: previous.unit,
                expression: newSimpleExpression
            } as ResultNodeFunctionState;
        default:
            throw new Error(`unkown node function type '${newFunctionType}'`);
    }
};

export const getDefaultNodeStyleState = (styleType: NodeStyleType) => {
    switch (styleType) {
        case COST_STYLE_TYPE:
            return {
                type: COST_STYLE_TYPE
            } as AbstractNodeStyleState<CostStyleType>;
        case RISK_STYLE_TYPE:
            return {
                type: RISK_STYLE_TYPE
            } as AbstractNodeStyleState<RiskStyleType>;
        case BENEFIT_STYLE_TYPE:
            return {
                type: BENEFIT_STYLE_TYPE
            } as AbstractNodeStyleState<BenefitStyleType>;
        case RESULT_STYLE_TYPE:
            return {
                type: RESULT_STYLE_TYPE
            } as AbstractNodeStyleState<ResultStyleType>;
        case GENERIC_STYLE_TYPE:
            return {
                type: GENERIC_STYLE_TYPE
            } as AbstractNodeStyleState<GenericStyleType>;
        case COLLECTION_STYLE_TYPE:
            return {
                type: COLLECTION_STYLE_TYPE
            } as CollectionNodePresetStyleState;
        case CUSTOM_STYLE_TYPE:
            return {
                type: CUSTOM_STYLE_TYPE,
                backgroundColor: "#fff",
                borderWidth: 1.5,
                shape: NODE_STYLE_BOX_SHAPE,
                border: NODE_STYLE_BORDER_SOLID
            } as CustomNodeStyleState;
        default:
            throw new Error(`unkown node style type '${styleType}'`);
    }
};
