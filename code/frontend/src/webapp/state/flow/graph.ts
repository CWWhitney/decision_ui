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

import * as common from "@decision-support-ui/common";
import { useProjectSettingsStore } from "../projects/settings";
import { generateVariableName } from "@/editor/common/variables";

export const FLOW_GRAPH_STORE_ID = "flow.graph";

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

const getVueFlowEdge = (
    edge: common.Edge,
    getComputedNodePosition: (nodeId: string) => common.Position,
    style: Styles = {}
) => {
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
    const evaluateExpressionForVariableDependencies = common.getExpressionEvaluatorForVariableDependencies();
    const evaluateExpressionForTensor = common.getExpressionEvaluatorForTensor();

    // --- persisted state
    const state = useSessionStorage(FLOW_GRAPH_STORE_ID, {
        nodes: [] as common.Node[],
        edges: [] as common.Edge[]
    });

    const { nodes, edges } = toRefs(state.value);

    // --- computed state

    const computedComputationContext = computed(
        () =>
            ({
                mcRuns: projectSettings.mcRuns
            }) as common.ComputationContext
    );

    const _nodesByIdMap = computed(() => common.getNodeByIdMap(nodes.value));
    const _childrenByParentIdMap = computed(() => common.getChildrenByParentIdMap(nodes.value));
    const _nodeIdByVariableMap = computed(
        () => new Map(nodes.value.map(n => [getComputedVariableName(n.id).value, n.id]))
    );

    const getComputedNode = computedByKey((nodeId: common.NodeId) =>
        common.getFromMapOrThrow(nodeId, _nodesByIdMap.value)
    );
    const getComputedNodeIdFromVariableName = computedByKey((variableName: string) =>
        common.getFromMapOrThrow(variableName, _nodeIdByVariableMap.value)
    );
    const isVariableNameValid = (variableName: string) => _nodeIdByVariableMap.value.has(variableName);

    const getComputedNodePosition = computedByKey(
        (nodeId: common.NodeId): common.Position =>
            common.getNodePositionRecursion(
                nodeId,
                (nodeId: common.NodeId) => getComputedNode(nodeId).value,
                (nodeId: common.NodeId, _getNode: (nodeId: common.NodeId) => common.Node) =>
                    getComputedNodePosition(nodeId).value
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
                            label: node.visualization.title,
                            border: node.visualization.style.border
                        }
                    }) as VueFlowNode
            );
        });

    const getComputedVueFlowEdges = () =>
        computed(() => {
            const computationEdges = common.getComputationEdges(
                nodes.value,
                (nodeId: string) => {
                    const dependencies = getComputedVariableDependencies(nodeId).value;
                    return dependencies.type == "success" ? dependencies.value : [];
                },
                variableName => isVariableNameValid(variableName),
                variableName => getComputedNodeIdFromVariableName(variableName).value
            );

            return [
                ...computationEdges.map(edge =>
                    getVueFlowEdge(edge, (nodeId: string) => getComputedNodePosition(nodeId).value)
                ),
                ...common.filterManualEdgesByComputationEdges(edges.value, computationEdges).map(edge =>
                    getVueFlowEdge(edge, (nodeId: string) => getComputedNodePosition(nodeId).value, {
                        strokeDasharray: 5
                    })
                )
            ];
        });

    const getComputedAncestorNodes = computedByKey((nodeId: common.NodeId): common.Node[] =>
        common.getAncestorNodesRecursion(
            nodeId,
            (nodeId: common.NodeId) => getComputedNode(nodeId).value,
            (nodeId: common.NodeId, _getNode: (nodeId: common.NodeId) => common.Node) =>
                getComputedAncestorNodes(nodeId).value
        )
    );

    const getComputedDescendantNodes = computedByKey((nodeId: common.NodeId): common.Node[] =>
        common.getDescendantNodesRecursion(
            nodeId,
            _childrenByParentIdMap.value,
            (nodeId: common.NodeId, _childrenByParentIdMap: Map<common.NodeId, common.Node[]>) =>
                getComputedDescendantNodes(nodeId).value
        )
    );

    const getComputedVariableName = computedByKey((nodeId: common.NodeId): string =>
        generateVariableName(getComputedNode(nodeId).value.visualization.title)
    );

    const getComputedVariableDependencies = computedByKey(
        (nodeId: common.NodeId): common.ComputedResult<common.VariableDependencies> => {
            const node = getComputedNode(nodeId).value;
            if (node.type == common.OPERATION_NODE_TYPE || node.type == common.RESULT_NODE_TYPE) {
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
            } else if (node.type == common.LOOP_OPERATION_NODE_TYPE) {
                try {
                    return {
                        type: "success",
                        value: [
                            ...evaluateExpressionForVariableDependencies(node.options.initExpression),
                            ...evaluateExpressionForVariableDependencies(node.options.iterExpression)
                        ].filter(v => v !== "previous" && v !== "i")
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
        }
    );

    const getComputedTensor = computedByKey(
        (
            nodeId: common.NodeId,
            previousTensor: common.ComputedResult<common.Tensor> | undefined
        ): common.ComputedResult<common.Tensor> => {
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
                const getNodeIdForVariable = (variable: string) => getComputedNodeIdFromVariableName(variable).value;
                const getTensorForNode = (nodeId: string) => {
                    const computedTensor = getComputedTensor(nodeId).value;
                    if (computedTensor.type == "error") throw new Error(computedTensor.message);
                    return computedTensor.value;
                };
                return {
                    type: "success",
                    value: common.getTensorForNodeRecursion(
                        nodeId,
                        getNode,
                        getVariableDependencies,
                        getNodeIdForVariable,
                        evaluateExpressionForTensor,
                        getTensorForNode,
                        computedComputationContext.value
                    )
                } as common.ComputedResult<common.Tensor>;
            } catch (e) {
                return {
                    type: "error",
                    message: e instanceof Error ? `${e.message}` : `${e}`
                };
            }
        }
    );

    const getComputedTensorDescriptor = computedByKey(
        (nodeId: common.NodeId): common.ComputedResult<common.TensorDescriptor> => {
            const tensorResult = getComputedTensor(nodeId).value;
            if (tensorResult.type == "error") {
                return {
                    type: "error",
                    message: tensorResult.message
                };
            }
            return {
                type: "success",
                value: common.tensorToDescriptor(tensorResult.value)
            };
        }
    );

    const getComputedDeterministicValue = computedByKey(
        async (nodeId: common.NodeId): Promise<common.ComputedResult<number>> => {
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
        }
    );

    const getComputedProbabilisticHistogramData = computedByKey(
        async (nodeId: common.NodeId): Promise<common.ComputedResult<common.HistogramData>> => {
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
            if (tensorDescriptor.value.type !== common.PROBABILISTIC_TYPE) {
                return {
                    type: "error",
                    message: `Can only calculate histogram for probabilistic value`
                };
            }
            return {
                type: "success",
                value: await common.getHistogramBinsFromTensor(tensorResult.value, projectSettings.histogramBins)
            };
        }
    );

    const getComputedSeriesPlotData = computedByKey(
        async (nodeId: common.NodeId): Promise<common.ComputedResult<common.SeriesPlotData>> => {
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
            if (tensorDescriptor.value.type !== common.SERIES_TYPE) {
                return {
                    type: "error",
                    message: `can only calculate series plot data for series value`
                };
            }
            return {
                type: "success",
                value: await common.getSeriesPlotDataFromTensor(tensorResult.value)
            };
        }
    );

    // --- actions

    const addEdgeFromVueFlowConnectionAction = (connection: VueFlowConnection) => {
        const edgeId = common.getEdgeIdForNodes(connection.source, connection.target);
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

    const updateNodePositionAction = (nodeId: common.NodeId, position: common.Position) => {
        const node = getComputedNode(nodeId).value;
        node.visualization.position = position;
    };

    const updateNodeSizeAction = (nodeId: common.NodeId, size: common.Size) => {
        const node = getComputedNode(nodeId).value;
        node.visualization.size = size;
    };

    const addNewNodeAction = (nodeType: common.NodeType, options?: common.NewNodeOptions): common.NodeId => {
        const newNode = common.getNewNode(nodeType, nodes.value, options);
        nodes.value.push(newNode);
        return newNode.id;
    };

    const removeNodeAction = (nodeId: common.NodeId) => {
        const node = getComputedNode(nodeId).value;
        const removeNodeIds = [nodeId, ...getComputedDescendantNodes(node.id).value.map(n => n.id)];
        const removeEdgeIds = edges.value
            .filter(e => removeNodeIds.includes(e.source) || removeNodeIds.includes(e.target))
            .map(e => e.id);
        nodes.value = nodes.value.filter(n => !removeNodeIds.includes(n.id));
        edges.value = edges.value.filter(e => !removeEdgeIds.includes(e.id));
    };

    const setNodeExpressionAction = (nodeId: common.NodeId, expression: string) => {
        const node = getComputedNode(nodeId).value;
        if (node.type == common.OPERATION_NODE_TYPE || node.type == common.RESULT_NODE_TYPE) {
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
        getComputedSeriesPlotData,
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
