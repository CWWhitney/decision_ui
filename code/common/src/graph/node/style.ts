import { Schema } from "ajv";

export const COST_STYLE_TYPE = "cost";
export const BENEFIT_STYLE_TYPE = "benefit";
export const RISK_STYLE_TYPE = "risk";
export const GENERIC_STYLE_TYPE = "generic";
export const RESULT_STYLE_TYPE = "result";
export const COLLECTION_STYLE_TYPE = "collection";
export const CUSTOM_STYLE_TYPE = "custom";

export type CostStyleType = "cost";
export type BenefitStyleType = "benefit";
export type RiskStyleType = "risk";
export type GenericStyleType = "generic";
export type ResultStyleType = "result";
export type CollectionStyleType = "collection";
export type CustomStyleType = "custom";

export type VariableNodeStyleType =
    | CostStyleType
    | BenefitStyleType
    | RiskStyleType
    | GenericStyleType
    | ResultStyleType
    | CustomStyleType;

export type CollectionNodeStyleType = CollectionStyleType | CustomStyleType;

export type SubgraphNodeStyleType =
    | CostStyleType
    | BenefitStyleType
    | RiskStyleType
    | GenericStyleType
    | ResultStyleType
    | CustomStyleType;

export type NodeStyleType = VariableNodeStyleType | CollectionNodeStyleType | SubgraphNodeStyleType;

export const NODE_STYLE_TYPES: NodeStyleType[] = [
    COST_STYLE_TYPE,
    BENEFIT_STYLE_TYPE,
    RISK_STYLE_TYPE,
    RESULT_STYLE_TYPE,
    GENERIC_STYLE_TYPE,
    COLLECTION_STYLE_TYPE,
    CUSTOM_STYLE_TYPE
];

export const PRESET_STYLE_TYPES: NodeStyleType[] = [
    COST_STYLE_TYPE,
    BENEFIT_STYLE_TYPE,
    RISK_STYLE_TYPE,
    RESULT_STYLE_TYPE,
    GENERIC_STYLE_TYPE,
    COLLECTION_STYLE_TYPE
];

export const VARIABLE_NODE_STYLE_TYPES: VariableNodeStyleType[] = [
    COST_STYLE_TYPE,
    BENEFIT_STYLE_TYPE,
    RISK_STYLE_TYPE,
    RESULT_STYLE_TYPE,
    GENERIC_STYLE_TYPE,
    CUSTOM_STYLE_TYPE
];

export const COLLECTION_NODE_STYLE_TYPES: CollectionNodeStyleType[] = [COLLECTION_STYLE_TYPE, CUSTOM_STYLE_TYPE];

export const SUBGRAPH_NODE_STYLE_TYPES: SubgraphNodeStyleType[] = [
    COST_STYLE_TYPE,
    BENEFIT_STYLE_TYPE,
    RISK_STYLE_TYPE,
    RESULT_STYLE_TYPE,
    GENERIC_STYLE_TYPE,
    CUSTOM_STYLE_TYPE
];

// node shape style

export type NodeStyleBoxShape = "box";
export type NodeStyleRoundedBoxShape = "rounded-box";
export type NodeStyleEllipseShape = "ellipse";

export const NODE_STYLE_BOX_SHAPE = "box";
export const NODE_STYLE_ROUNDED_BOX_SHAPE = "rounded-box";
export const NODE_STYLE_ELLIPSE_SHAPE = "ellipse";

export const NODE_STYLE_SHAPE_VARIANTS = [NODE_STYLE_BOX_SHAPE, NODE_STYLE_ROUNDED_BOX_SHAPE, NODE_STYLE_ELLIPSE_SHAPE];

export type NodeStyleShapeVariant = NodeStyleBoxShape | NodeStyleRoundedBoxShape | NodeStyleEllipseShape;

// node style border variants

export type NodeStyleBorderSolid = "solid";
export type NodeStyleBorderDashed = "dashed";
export type NodeStyleBorderDotted = "dotted";

export const NODE_STYLE_BORDER_SOLID = "solid";
export const NODE_STYLE_BORDER_DASHED = "dashed";
export const NODE_STYLE_BORDER_DOTTED = "dotted";

export const NODE_STYLE_BORDER_VARIANTS = [NODE_STYLE_BORDER_SOLID, NODE_STYLE_BORDER_DASHED, NODE_STYLE_BORDER_DOTTED];

export type NodeStyleBorderVariant = NodeStyleBorderSolid | NodeStyleBorderDashed | NodeStyleBorderDotted;

// node style state

export interface AbstractNodeStyleState<T extends NodeStyleType> {
    type: T;
}

export interface CustomNodeStyleState extends AbstractNodeStyleState<CustomStyleType> {
    shape: NodeStyleShapeVariant;
    backgroundColor: string;
    borderWidth: number;
    border: NodeStyleBorderVariant;
}

export type VariableNodePresetStyleState = AbstractNodeStyleState<
    CostStyleType | RiskStyleType | BenefitStyleType | ResultStyleType | GenericStyleType
>;

export type SubgraphNodePresetStyleState = AbstractNodeStyleState<
    CostStyleType | RiskStyleType | BenefitStyleType | ResultStyleType | GenericStyleType
>;

export type CollectionNodePresetStyleState = AbstractNodeStyleState<CollectionStyleType>;

export type VariableNodeStyleState = VariableNodePresetStyleState | CustomNodeStyleState;
export type CollectionNodeStyleState = CollectionNodePresetStyleState | CustomNodeStyleState;
export type SubgraphNodeStyleState = SubgraphNodePresetStyleState | CustomNodeStyleState;

export type NodeStyleState = VariableNodeStyleState | CollectionNodeStyleState | SubgraphNodeStyleState;

export const NodeStyleSchema: Schema = {
    type: "object",
    properties: {
        type: { enum: NODE_STYLE_TYPES }
    },
    required: ["type"],
    allOf: [
        {
            if: {
                properties: { type: { enum: PRESET_STYLE_TYPES } }
            },
            then: {}
        },
        {
            if: {
                properties: { type: { const: CUSTOM_STYLE_TYPE } }
            },
            then: {
                properties: {
                    shape: {
                        type: "string",
                        enum: NODE_STYLE_SHAPE_VARIANTS
                    },
                    backgroundColor: { type: "string" },
                    borderWidth: { type: "number" },
                    border: { enum: NODE_STYLE_BORDER_VARIANTS }
                },
                required: ["shape", "backgroundColor", "borderWidth", "border"]
            }
        }
    ]
};
