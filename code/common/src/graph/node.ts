import { Position, Size } from "../draw";
import { DistributionFunctionType, NORMAL_DISTRIBUTION_TYPE } from "../compute/math";
import { generateVariableName } from "../compute/variables";

// node id

export type NodeId = string;

// node type

export const VARIABLE_NODE_TYPE = "variable";
export const COLLECTION_NODE_TYPE = "collection";

export type VariableNodeType = "variable";
export type CollectionNodeType = "collection";

export type NodeType = VariableNodeType | CollectionNodeType;

export const AVAILABLE_NODE_TYPES: NodeType[] = [VARIABLE_NODE_TYPE, COLLECTION_NODE_TYPE];

// node function type

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

// node style preset

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

export type NodeStyleType = VariableNodeStyleType | CollectionNodeStyleType;

export const AVAILABLE_VARIABLE_NODE_STYLE_TYPES: VariableNodeStyleType[] = [
    COST_STYLE_TYPE,
    BENEFIT_STYLE_TYPE,
    RISK_STYLE_TYPE,
    RESULT_STYLE_TYPE,
    GENERIC_STYLE_TYPE,
    CUSTOM_STYLE_TYPE
];

export const AVAILABLE_COLLECTION_NODE_STYLE_TYPES: CollectionNodeStyleType[] = [
    COLLECTION_STYLE_TYPE,
    CUSTOM_STYLE_TYPE
];

// node border style

export type NodeStyleDefaultBorder = "default";
export type NodeStyleSharpBorder = "sharp";
export type NodeStyleRoundBorder = "round";
export type NodeStyleEllipseBorder = "ellipse";

export const NODE_STYLE_DEFAULT_BORDER = "default";
export const NODE_STYLE_SHARP_BORDER = "sharp";
export const NODE_STYLE_ROUND_BORDER = "round";
export const NODE_STYLE_ELLIPSE_BORDER = "ellipse";

export const NODE_STYLE_BORDER_VARIANTS = [
    NODE_STYLE_DEFAULT_BORDER,
    NODE_STYLE_SHARP_BORDER,
    NODE_STYLE_ROUND_BORDER,
    NODE_STYLE_ELLIPSE_BORDER
];

export type NodeStyleBorderVariant =
    | NodeStyleDefaultBorder
    | NodeStyleSharpBorder
    | NodeStyleRoundBorder
    | NodeStyleEllipseBorder;

// node function state

export interface AbstractNodeFunctionState<T extends NodeFunctionType> {
    type: T;
}

export interface AbstractVariableNodeFunctionState<T extends NodeFunctionType> extends AbstractNodeFunctionState<T> {
    variable: string;
}

export interface EstimateNodeFunctionState extends AbstractVariableNodeFunctionState<EstimateFunctionType> {
    distribution: DistributionFunctionType;
    lower: number;
    upper: number;
    comment: string;
}

export interface OperationNodeFunctionState extends AbstractVariableNodeFunctionState<OperationFunctionType> {
    expression: string;
}

export interface LoopNodeFunctionState extends AbstractVariableNodeFunctionState<LoopFunctionType> {
    iterations: number;
    initExpression: string;
    iterExpression: string;
}

export interface ResultNodeFunctionState extends AbstractVariableNodeFunctionState<ResultFunctionType> {
    expression: string;
}

export type EmptyNodeFunctionState = AbstractNodeFunctionState<EmptyFunctionType>;

export type VariableNodeFunctionState =
    | EstimateNodeFunctionState
    | OperationNodeFunctionState
    | LoopNodeFunctionState
    | ResultNodeFunctionState;

export type NodeFunctionState = VariableNodeFunctionState | EmptyNodeFunctionState;

// node style state

export interface AbstractNodeStyleState<T extends NodeStyleType> {
    type: T;
}

export interface CustomNodeStyleState extends AbstractNodeStyleState<CustomStyleType> {
    border: NodeStyleBorderVariant;
}

export type VariableNodePresetStyleState = AbstractNodeStyleState<
    CostStyleType | RiskStyleType | BenefitStyleType | ResultStyleType | GenericStyleType
>;

export type CollectionNodePresetStyleState = AbstractNodeStyleState<CollectionStyleType>;

export type VariableNodeStyleState = VariableNodePresetStyleState | CustomNodeStyleState;
export type CollectionNodeStyleState = CollectionNodePresetStyleState | CustomNodeStyleState;

export type NodeStyleState = VariableNodeStyleState | CollectionNodeStyleState;

// node state

export interface AbstractNode<F extends NodeFunctionState, S extends NodeStyleState> {
    id: NodeId;
    type: NodeType;
    parentNodeId: NodeId | null;

    function: F;

    visualization: {
        title: string;
        position: Position;
        size: Size;
        style: S;
    };
}

export type VariableNode = AbstractNode<VariableNodeFunctionState, VariableNodeStyleState>;
export type CollectionNode = AbstractNode<EmptyNodeFunctionState, CollectionNodeStyleState>;

export type Node = VariableNode | CollectionNode;

// default state helper

export const getDefaultNodeSize = (nodeType: NodeType): Size => {
    switch (nodeType) {
        case VARIABLE_NODE_TYPE:
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
                distribution: NORMAL_DISTRIBUTION_TYPE,
                lower: -1,
                upper: 1,
                comment: ""
            } as EstimateNodeFunctionState;
        case OPERATION_FUNCTION_TYPE:
            return {
                type: OPERATION_FUNCTION_TYPE,
                variable,
                expression: ""
            };
        case LOOP_FUNCTION_TYPE:
            return {
                type: LOOP_FUNCTION_TYPE,
                variable,
                iterations: 10,
                initExpression: "",
                iterExpression: ""
            } as LoopNodeFunctionState;
        case RESULT_FUNCTION_TYPE:
            return {
                type: RESULT_FUNCTION_TYPE,
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
                border: NODE_STYLE_DEFAULT_BORDER
            } as CustomNodeStyleState;
        default:
            throw new Error(`unkown node style type '${styleType}'`);
    }
};

export type NodeByIdMap = Map<NodeId, Node>;
export type NodeChildrenByParentIdMap = Map<NodeId, Node[]>;

/**
 * Return a map from node id to node state for a list of nodes.
 *
 * @param nodes the list of nodes
 * @returns a map of nodes from id to node state
 */
export const getNodeByIdMap = (nodes: Node[]): NodeByIdMap => {
    return new Map(nodes.map(n => [n.id, n]));
};

export const getNodeByIdFromMap = (nodeId: NodeId, nodeMap: NodeByIdMap) => {
    const node = nodeMap.get(nodeId);
    if (!node) {
        throw new Error(`could not find node '${nodeId}' in graph`);
    }
    return node;
};

export const getChildrenByParentIdMap = (nodes: Node[]): NodeChildrenByParentIdMap => {
    const map = new Map<NodeId, Node[]>();

    for (const node of nodes) {
        if (!node.parentNodeId) {
            continue;
        }

        const children = map.get(node.parentNodeId);
        if (children) {
            children.push(node);
        } else {
            map.set(node.parentNodeId, [node]);
        }
    }

    return map;
};

export const getNodePositionRecursion = (
    nodeId: NodeId,
    getNode: (nodeId: NodeId) => Node,
    self: (nodeId: NodeId, getNode: (nodeId: NodeId) => Node) => Position
): Position => {
    const node = getNode(nodeId);

    if (!node.parentNodeId) {
        return node.visualization.position;
    }

    return {
        x: node.visualization.position.x + self(node.parentNodeId, getNode).x,
        y: node.visualization.position.y + self(node.parentNodeId, getNode).y
    } as Position;
};

export const getNodePosition = (nodeId: NodeId, getNode: (nodeId: NodeId) => Node): Position =>
    getNodePositionRecursion(nodeId, getNode, getNodePosition);

export const getNextNodeId = (nodes: Node[]): NodeId => {
    return `${nodes.reduce((i: number, node) => Math.max(parseInt(node.id) ?? 0, i), 0) + 1}`;
};

export interface NewNodeOptions {
    parentNodeId?: NodeId | null;
    position?: Position;
    size?: Size;
}

export const getNewNode = (
    title: string,
    nodeType: NodeType,
    functionType: NodeFunctionType,
    styleType: NodeStyleType,
    nodes: Node[],
    options?: NewNodeOptions
): Node => {
    const nextNodeId = getNextNodeId(nodes);
    const nodeTitle = `${title} ${nextNodeId}`;
    const variable = generateVariableName(nodeTitle);
    return {
        id: nextNodeId,
        type: nodeType,
        parentNodeId: options?.parentNodeId ?? null,
        function: getDefaultFunctionState(variable, functionType),
        visualization: {
            title: nodeTitle,
            position: options?.position ?? { x: 0, y: 0 },
            size: options?.size ?? getDefaultNodeSize(nodeType),
            style: getDefaultNodeStyleState(styleType)
        }
    } as Node;
};

export const getAncestorNodesRecursion = (
    nodeId: NodeId,
    getNode: (nodeId: string) => Node,
    self: (nodeId: NodeId, getNode: (nodeId: string) => Node) => Node[]
): Node[] => {
    const node = getNode(nodeId);
    if (node.parentNodeId) {
        const parentNode = getNode(node.parentNodeId);
        return [parentNode, ...self(parentNode.id, getNode)];
    }
    return [] as Node[];
};

export const getDescendantNodesRecursion = (
    nodeId: NodeId,
    childrenByParentIdMap: Map<NodeId, Node[]>,
    self: (nodeId: NodeId, childrenByParentIdMap: Map<NodeId, Node[]>) => Node[]
): Node[] => {
    return (childrenByParentIdMap.get(nodeId) ?? []).reduce(
        (p, n) => [...p, n, ...self(n.id, childrenByParentIdMap)],
        [] as Node[]
    );
};
