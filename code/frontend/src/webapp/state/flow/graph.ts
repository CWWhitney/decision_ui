import { computed, toRefs, type ComputedRef } from "vue";

import {
    type Node as VueFlowNode,
    type Edge as VueFlowEdge,
    MarkerType,
    type Connection as VueFlowConnection,
    type Styles
} from "@vue-flow/core";

import { getHandlePositions } from "@/common/layout";
import { defineStore } from "pinia";
import { useSessionStorage } from "@vueuse/core";

import {
    type Node,
    type Edge,
    type NodeType,
    getNodeByIdMap,
    getChildrenByParentIdMap,
    type NodeId,
    getEdgeIdForNodes,
    getNodePositionRecursion,
    type Position,
    type NewNodeOptions,
    getNewNode,
    getAncestorNodesRecursion,
    getDescendantNodesRecursion,
    type ComputationContext,
    type Size,
    OPERATION_NODE_TYPE,
    type VariableDependencies,
    getExpressionEvaluatorForVariableDependencies,
    getExpressionEvaluatorForTensor,
    getTensorForNodeRecursion,
    tensorToDescriptor,
    getHistogramBinsFromTensor,
    type Tensor,
    PROBABILISTIC_TYPE,
    type TensorDescriptor,
    type HistogramData,
    RESULT_NODE_TYPE,
    getFromMapOrThrow,
    getComputationEdges,
    filterManualEdgesByComputationEdges
} from "@decision-support-ui/common";
import { useProjectSettingsStore } from "../projects/settings";
import { generateVariableName } from "@/editor/common/variables";

export const FLOW_GRAPH_STORE_ID = "flow.graph";

export type ComputedResult<T> =
    | {
          type: "success";
          value: T;
      }
    | {
          type: "error";
          message: string;
      };

const computedByKey = <K, T>(get: (key: K, previous: T | undefined) => T) => {
    const cache = new Map<K, ComputedRef<T>>();
    return (key: K): ComputedRef<T> => {
        if (!cache.has(key)) {
            cache.set(
                key,
                computed(previous => get(key, previous))
            );
        }
        return cache.get(key)!;
    };
};

const getVueFlowEdge = (edge: Edge, getComputedNodePosition: (nodeId: string) => Position, style: Styles = {}) => {
    const sourceNodePosition = getComputedNodePosition(edge.source);
    const targetNodePosition = getComputedNodePosition(edge.target);

    const [sourceHandle, targetHandle] = getHandlePositions(sourceNodePosition, targetNodePosition);
    return {
        id: edge.id,
        source: `${edge.source}`,
        target: `${edge.target}`,
        sourceHandle: sourceHandle,
        targetHandle: targetHandle,
        type: "custom",
        style,
        markerEnd: MarkerType.Arrow
    } as VueFlowEdge;
};

export const useFlowGraphStore = defineStore(FLOW_GRAPH_STORE_ID, () => {
    const projectSettings = useProjectSettingsStore();
    const evaluateExpressionForVariableDependencies = getExpressionEvaluatorForVariableDependencies();
    const evaluateExpressionForTensor = getExpressionEvaluatorForTensor();

    // --- persisted state
    const state = useSessionStorage(FLOW_GRAPH_STORE_ID, {
        nodes: [] as Node[],
        edges: [] as Edge[]
    });

    const { nodes, edges } = toRefs(state.value);

    // --- computed state

    const computedComputationContext = computed(
        () =>
            ({
                mcRuns: projectSettings.mcRuns
            }) as ComputationContext
    );

    const _nodesByIdMap = computed(() => getNodeByIdMap(nodes.value));
    const _childrenByParentIdMap = computed(() => getChildrenByParentIdMap(nodes.value));
    const _nodeIdByVariableMap = computed(
        () => new Map(nodes.value.map(n => [getComputedVariableName(n.id).value, n.id]))
    );

    const getComputedNode = computedByKey((nodeId: NodeId) => getFromMapOrThrow(nodeId, _nodesByIdMap.value));
    const getComputedNodeFromVariableName = computedByKey((variableName: string) =>
        getFromMapOrThrow(variableName, _nodeIdByVariableMap.value)
    );
    const isVariableNameValid = (variableName: string) => _nodeIdByVariableMap.value.has(variableName);

    const getComputedNodePosition = computedByKey(
        (nodeId: NodeId): Position =>
            getNodePositionRecursion(
                nodeId,
                (nodeId: NodeId) => getComputedNode(nodeId).value,
                (nodeId: NodeId, _getNode: (nodeId: NodeId) => Node) => getComputedNodePosition(nodeId).value
            )
    );

    const getComputedVueFlowNodes = () =>
        computed(() => {
            return nodes.value.map(
                node =>
                    ({
                        id: node.id,
                        position: node.visualization.position,
                        type: "custom",
                        class: node.type,
                        width: node.visualization.size.width,
                        height: node.visualization.size.height,
                        parentNode: node.parentNodeId,
                        extent: "parent",
                        expandParent: true,
                        data: {
                            label: node.visualization.title
                        }
                    }) as VueFlowNode
            );
        });

    const getComputedVueFlowEdges = () =>
        computed(() => {
            const computationEdges = getComputationEdges(
                nodes.value,
                (nodeId: string) => {
                    const dependencies = getComputedVariableDependencies(nodeId).value;
                    return dependencies.type == "success" ? dependencies.value : [];
                },
                variableName => isVariableNameValid(variableName),
                variableName => getComputedNodeFromVariableName(variableName).value
            );

            return [
                ...computationEdges.map(edge =>
                    getVueFlowEdge(edge, (nodeId: string) => getComputedNodePosition(nodeId).value)
                ),
                ...filterManualEdgesByComputationEdges(edges.value, computationEdges).map(edge =>
                    getVueFlowEdge(edge, (nodeId: string) => getComputedNodePosition(nodeId).value, {
                        strokeDasharray: 5
                    })
                )
            ];
        });

    const getComputedAncestorNodes = computedByKey((nodeId: NodeId): Node[] =>
        getAncestorNodesRecursion(
            nodeId,
            (nodeId: NodeId) => getComputedNode(nodeId).value,
            (nodeId: NodeId, _getNode: (nodeId: NodeId) => Node) => getComputedAncestorNodes(nodeId).value
        )
    );

    const getComputedDescendantNodes = computedByKey((nodeId: NodeId): Node[] =>
        getDescendantNodesRecursion(
            nodeId,
            _childrenByParentIdMap.value,
            (nodeId: NodeId, _childrenByParentIdMap: Map<NodeId, Node[]>) => getComputedDescendantNodes(nodeId).value
        )
    );

    const getComputedVariableName = computedByKey((nodeId: NodeId): string =>
        generateVariableName(getComputedNode(nodeId).value.visualization.title)
    );

    const getComputedVariableDependencies = computedByKey((nodeId: NodeId): ComputedResult<VariableDependencies> => {
        const node = getComputedNode(nodeId).value;
        if (node.type == OPERATION_NODE_TYPE || node.type == RESULT_NODE_TYPE) {
            try {
                return {
                    type: "success",
                    value: evaluateExpressionForVariableDependencies(node.options.expression)
                };
            } catch (e) {
                return {
                    type: "error",
                    message: e instanceof Error ? `${e.message}` : `${e}`
                };
            }
        }
        return {
            type: "success",
            value: []
        };
    });

    const getComputedTensor = computedByKey(
        (nodeId: NodeId, previousTensor: ComputedResult<Tensor> | undefined): ComputedResult<Tensor> => {
            if (previousTensor && previousTensor.type == "success") {
                previousTensor.value.dispose();
            }

            try {
                const getNode = (nodeId: string) => getComputedNode(nodeId).value;
                const getVariableDependencies = (nodeId: string) => {
                    const computedDependencies = getComputedVariableDependencies(nodeId).value;
                    if (computedDependencies.type == "error") throw new Error(computedDependencies.message);
                    return computedDependencies.value;
                };
                const getNodeIdForVariable = (variable: string) => {
                    const nodeId = _nodeIdByVariableMap.value.get(variable);
                    if (!nodeId) throw new Error(`variable '${variable}' unknown`);
                    return nodeId;
                };
                const getTensorForNode = (nodeId: string) => {
                    const computedTensor = getComputedTensor(nodeId).value;
                    if (computedTensor.type == "error") throw new Error(computedTensor.message);
                    return computedTensor.value;
                };
                return {
                    type: "success",
                    value: getTensorForNodeRecursion(
                        nodeId,
                        getNode,
                        getVariableDependencies,
                        getNodeIdForVariable,
                        evaluateExpressionForTensor,
                        getTensorForNode,
                        computedComputationContext.value
                    )
                } as ComputedResult<Tensor>;
            } catch (e) {
                return {
                    type: "error",
                    message: e instanceof Error ? `${e.message}` : `${e}`
                };
            }
        }
    );

    const getComputedTensorDescriptor = computedByKey((nodeId: NodeId): ComputedResult<TensorDescriptor> => {
        const tensorResult = getComputedTensor(nodeId).value;
        if (tensorResult.type == "error") {
            return {
                type: "error",
                message: tensorResult.message
            };
        }
        return {
            type: "success",
            value: tensorToDescriptor(tensorResult.value)
        };
    });

    const getComputedDeterministicValue = computedByKey(async (nodeId: NodeId): Promise<ComputedResult<number>> => {
        const tensorResult = getComputedTensor(nodeId).value;
        if (tensorResult.type == "error") {
            return {
                type: "error",
                message: tensorResult.message
            };
        }
        return {
            type: "success",
            value: (await tensorResult.value.array()) as number
        };
    });

    const getComputedProbabilisticHistogramData = computedByKey(
        async (nodeId: NodeId): Promise<ComputedResult<HistogramData>> => {
            const tensorDescriptor = getComputedTensorDescriptor(nodeId).value;
            const tensorResult = getComputedTensor(nodeId).value;

            if (tensorResult.type == "error") {
                return {
                    type: "error",
                    message: tensorResult.message
                };
            }
            if (tensorDescriptor.type == "error") {
                return {
                    type: "error",
                    message: tensorDescriptor.message
                };
            }
            if (tensorDescriptor.value.type !== PROBABILISTIC_TYPE) {
                return {
                    type: "error",
                    message: `Can only calculate histogram for probabilistic value`
                };
            }
            return {
                type: "success",
                value: await getHistogramBinsFromTensor(tensorResult.value, projectSettings.histogramBins)
            };
        }
    );

    // --- actions

    const addEdgeFromVueFlowConnectionAction = (connection: VueFlowConnection) => {
        const edgeId = getEdgeIdForNodes(connection.source, connection.target);
        edges.value = edges.value.filter(e => e.id != edgeId);
        edges.value.push({
            id: edgeId,
            source: connection.source,
            target: connection.target
        });
    };

    const removeEdgeAction = (edge_id: string) => {
        edges.value = edges.value.filter(e => e.id != edge_id);
    };

    const updateNodePositionAction = (nodeId: NodeId, position: Position) => {
        const node = getComputedNode(nodeId).value;
        node.visualization.position = position;
    };

    const updateNodeSizeAction = (nodeId: NodeId, size: Size) => {
        const node = getComputedNode(nodeId).value;
        node.visualization.size = size;
    };

    const addNewNodeAction = (nodeType: NodeType, options?: NewNodeOptions): NodeId => {
        const newNode = getNewNode(nodeType, nodes.value, options);
        nodes.value.push(newNode);
        return newNode.id;
    };

    const removeNodeAction = (nodeId: NodeId) => {
        const node = getComputedNode(nodeId).value;
        const removeNodeIds = [nodeId, ...getComputedDescendantNodes(node.id).value.map(n => n.id)];
        const removeEdgeIds = edges.value
            .filter(e => removeNodeIds.includes(e.source) || removeNodeIds.includes(e.target))
            .map(e => e.id);
        nodes.value = nodes.value.filter(n => !removeNodeIds.includes(n.id));
        edges.value = edges.value.filter(e => !removeEdgeIds.includes(e.id));
    };

    const setNodeExpressionAction = (nodeId: NodeId, expression: string) => {
        const node = getComputedNode(nodeId).value;
        if (node.type == OPERATION_NODE_TYPE || node.type == RESULT_NODE_TYPE) {
            node.options.expression = expression;
        } else {
            throw new Error(`cannot set expression for node ${node.id} of type ${node.type}`);
        }
    };

    const reset = () => {
        nodes.value = [];
        edges.value = [];
    };

    return {
        nodes,
        edges,
        getComputedVueFlowNodes,
        getComputedVueFlowEdges,
        getComputedNode,
        getComputedTensor,
        getComputedTensorDescriptor,
        getComputedDeterministicValue,
        getComputedProbabilisticHistogramData,
        getComputedAncestorNodes,
        getComputedDescendantNodes,
        getComputedVariableName,
        getComputedVariableDependencies,
        addEdgeFromVueFlowConnectionAction,
        removeEdgeAction,
        updateNodePositionAction,
        updateNodeSizeAction,
        addNewNodeAction,
        removeNodeAction,
        setNodeExpressionAction,
        reset
    };
});
