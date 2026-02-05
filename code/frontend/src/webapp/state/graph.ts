import { computed, type ComputedRef } from "vue";

import {
    type Node as VueFlowNode,
    type Edge as VueFlowEdge,
    MarkerType,
    type Connection as VueFlowConnection,
    type Styles
} from "@vue-flow/core";

import { getHandlePositions } from "@/common/layout";
import { defineStore } from "pinia";
import { useRefHistory, useSessionStorage } from "@vueuse/core";

import * as common from "@decision-support-ui/common";

import { useComputationSettingsStore } from "./settings";

export const FLOW_GRAPH_STORE_ID = "graph";

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
    const projectSettings = useComputationSettingsStore();
    const evaluateExpressionForVariableDependencies = common.getExpressionEvaluatorForVariableDependencies();
    const evaluateExpressionMatch = common.getExpressionMatchEvaluator();

    // --- persisted state
    const state = useSessionStorage(FLOW_GRAPH_STORE_ID, {
        nodes: [] as common.Node[],
        edges: [] as common.Edge[]
    });

    const history = useRefHistory(state, { deep: true, capacity: 50 });

    // --- computed state

    const computedComputationContext = computed(
        () =>
            ({
                mcRuns: projectSettings.mcRuns
            }) as common.ComputationContext
    );

    const _nodesByIdMap = computed(() => common.getNodeByIdMap(state.value.nodes));
    const _childrenByParentIdMap = computed(() => common.getChildrenByParentIdMap(state.value.nodes));
    const _nodeIdByVariableMap = computed(
        () =>
            new Map(
                state.value.nodes.filter(n => n.type == common.VARIABLE_NODE_TYPE).map(n => [n.function.variable, n.id])
            )
    );

    const getComputedNode = computedByKey((nodeId: common.NodeId) => {
        // console.log(`getComputedNode(${nodeId})`);
        return common.getFromMapOrThrow(nodeId, _nodesByIdMap.value);
    });
    const getComputedNodeIdFromVariableName = computedByKey((variableName: string) => {
        // console.log(`getComputedNodeIdFromVariableName(${variableName})`);
        return common.getFromMapOrThrow(variableName, _nodeIdByVariableMap.value);
    });
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
            return state.value.nodes.map(
                node =>
                    ({
                        id: node.id,
                        position: { ...node.visualization.position },
                        type: "custom",
                        class:
                            `${node.type}-type ` +
                            `${node.function.type}-function-type ` +
                            `${node.visualization.style.type}-style-type`,
                        width: node.visualization.size.width,
                        height: node.visualization.size.height,
                        parentNode: node.parentNodeId,
                        extent: "parent",
                        expandParent: true,
                        data: {
                            label: node.visualization.title,
                            nodeType: node.type,
                            ...(node.visualization.style.type == common.CUSTOM_STYLE_TYPE && {
                                border: node.visualization.style.border
                            })
                        }
                    }) as VueFlowNode
            );
        });

    const getComputedVueFlowEdges = () =>
        computed(() => {
            const computationEdges = common.getComputationEdges(
                state.value.nodes,
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
                ...common.filterManualEdgesByComputationEdges(state.value.edges, computationEdges).map(edge =>
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

    const getComputedVariableDependencies = computedByKey(
        (nodeId: common.NodeId): common.ComputedResult<common.VariableDependencies> => {
            const node = getComputedNode(nodeId).value;
            if (
                node.function.type == common.OPERATION_FUNCTION_TYPE ||
                node.function.type == common.RESULT_FUNCTION_TYPE
            ) {
                try {
                    return {
                        type: "success",
                        value: evaluateExpressionForVariableDependencies(node.function.expression)
                    };
                } catch (e) {
                    return {
                        type: "error",
                        message: e instanceof Error ? `${e.message}` : `${e}`
                    };
                }
            } else if (node.function.type == common.LOOP_FUNCTION_TYPE) {
                try {
                    return {
                        type: "success",
                        value: [
                            ...evaluateExpressionForVariableDependencies(node.function.iterationsExpression),
                            ...evaluateExpressionForVariableDependencies(node.function.initExpression),
                            ...evaluateExpressionForVariableDependencies(node.function.loopExpression)
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

    const getComputedExpressionMatches = computedByKey(
        (nodeId: common.NodeId): common.ComputedResult<common.NodeFunctionExpressionMatches> => {
            try {
                const node = getComputedNode(nodeId).value;
                return {
                    type: "success",
                    value: common.getExpressionMatchesForNode(node)
                };
            } catch (e) {
                console.error(`error match expressions for node '${nodeId}'`, e);
                return {
                    type: "error",
                    message: e instanceof Error ? `${e.message}` : `${e}`
                };
            }
        }
    );

    const getComputedTypedTensor = computedByKey(
        (
            nodeId: common.NodeId,
            previousTensor: common.ComputedResult<common.TypedTensor> | undefined
        ): common.ComputedResult<common.TypedTensor> => {
            const started = +new Date();
            if (previousTensor && previousTensor.type == "success") {
                previousTensor.value.tensor.dispose();
            }

            try {
                const getNode = (nodeId: string) => getComputedNode(nodeId).value;
                const getVariableDependencies = (nodeId: string) => {
                    const computedDependencies = getComputedVariableDependencies(nodeId).value;
                    if (computedDependencies.type == "error") throw new Error(computedDependencies.message);
                    return computedDependencies.value;
                };
                const getNodeIdForVariable = (variable: string) => getComputedNodeIdFromVariableName(variable).value;
                const getExpressionMatches = (nodeId: string) => {
                    const computedMatches = getComputedExpressionMatches(nodeId).value;
                    if (computedMatches.type == "error") throw new Error(computedMatches.message);
                    return computedMatches.value;
                };
                const getTensorForNode = (nodeId: string) => {
                    const computedTensor = getComputedTypedTensor(nodeId).value;
                    if (computedTensor.type == "error") throw new Error(computedTensor.message);
                    return computedTensor.value;
                };
                const result = {
                    type: "success",
                    value: common.getTypedTensorForNodeRecursion(
                        nodeId,
                        getNode,
                        getVariableDependencies,
                        getNodeIdForVariable,
                        getExpressionMatches,
                        evaluateExpressionMatch,
                        getTensorForNode,
                        computedComputationContext.value
                    )
                } as common.ComputedResult<common.TypedTensor>;
                console.log(`calculated tensor for node ${nodeId} in ${+new Date() - started}ms`);
                return result;
            } catch (e) {
                console.error(`error calculating tensor for node '${nodeId}'`, e);
                return {
                    type: "error",
                    message: e instanceof Error ? `${e.message}` : `${e}`
                };
            }
        }
    );

    const getComputedDeterministicValue = computedByKey(
        async (nodeId: common.NodeId): Promise<common.ComputedResult<number>> => {
            const tensorResult = getComputedTypedTensor(nodeId).value;
            if (tensorResult.type == "error") {
                return {
                    type: "error",
                    message: tensorResult.message
                };
            }
            return {
                type: "success",
                value: (await tensorResult.value.tensor.array()) as number
            };
        }
    );

    const getComputedProbabilisticHistogramData = computedByKey(
        async (nodeId: common.NodeId): Promise<common.ComputedResult<common.HistogramData>> => {
            console.log(`getComputedProbabilisticHistogramData(${nodeId})`);
            const ttResult = getComputedTypedTensor(nodeId).value;

            if (ttResult.type == "error") {
                return {
                    type: "error",
                    message: ttResult.message
                };
            }
            if (!ttResult.value.isProbabilistic) {
                return {
                    type: "error",
                    message: `Can only calculate histogram for probabilistic value`
                };
            }
            return {
                type: "success",
                value: await common.getHistogramBinsFromTensor(ttResult.value.tensor, projectSettings.histogramBins)
            };
        }
    );

    const getComputedProbabilisticSeriesPlotData = computedByKey(
        async (nodeId: common.NodeId): Promise<common.ComputedResult<common.ProbabilisticSeriesPlotData>> => {
            const ttResult = getComputedTypedTensor(nodeId).value;
            if (ttResult.type == "error") {
                return {
                    type: "error",
                    message: ttResult.message
                };
            }
            if (!ttResult.value.isSeries) {
                return {
                    type: "error",
                    message: `can only calculate series plot data for series value`
                };
            }
            if (!ttResult.value.isProbabilistic) {
                return {
                    type: "error",
                    message: `can only calculate probabilistic series plot data for probabilistic tensor`
                };
            }
            return {
                type: "success",
                value: await common.getProbabilisticSeriesPlotDataFromTensor(ttResult.value.tensor)
            };
        }
    );

    const getComputedDeterministicSeriesPlotData = computedByKey(
        async (nodeId: common.NodeId): Promise<common.ComputedResult<common.DeterministicSeriesPlotData>> => {
            const ttResult = getComputedTypedTensor(nodeId).value;
            if (ttResult.type == "error") {
                return {
                    type: "error",
                    message: ttResult.message
                };
            }
            if (!ttResult.value.isSeries) {
                return {
                    type: "error",
                    message: `can only calculate deterministic series plot data for series tensor`
                };
            }
            if (ttResult.value.isProbabilistic) {
                return {
                    type: "error",
                    message: `can only calculate deterministic series plot data for deterministc tensor`
                };
            }
            return {
                type: "success",
                value: await common.getDeterministicSeriesPlotDataFromTensor(ttResult.value.tensor)
            };
        }
    );

    // --- actions

    const addEdgeFromVueFlowConnectionAction = (connection: VueFlowConnection) => {
        const edgeId = common.getEdgeIdForNodes(connection.source, connection.target);
        state.value.edges = state.value.edges.filter(e => e.id != edgeId);
        state.value.edges.push({
            id: edgeId,
            source: connection.source,
            target: connection.target
        });
    };

    const removeEdgeAction = (edge_id: string) => {
        state.value.edges = state.value.edges.filter(e => e.id != edge_id);
    };

    const updateNodePositionAction = (nodeId: common.NodeId, position: common.Position) => {
        const node = getComputedNode(nodeId).value;
        if (node.visualization.position.x != position.x || node.visualization.position.y != position.y) {
            node.visualization.position = position;
        }
    };

    const updateNodeSizeAction = (nodeId: common.NodeId, size: common.Size) => {
        const node = getComputedNode(nodeId).value;
        if (node.visualization.size.width != size.width || node.visualization.size.height != size.height) {
            node.visualization.size = { ...size };
        }
    };

    const addNewNodeAction = (
        title: string,
        nodeType: common.NodeType,
        functionType: common.NodeFunctionType,
        styleType: common.NodeStyleType,
        options?: common.NewNodeOptions
    ) => {
        const newNode = common.getNewNode(title, nodeType, functionType, styleType, state.value.nodes, options);
        state.value.nodes = [...state.value.nodes, newNode];
    };

    const removeNodeAction = (nodeId: common.NodeId) => {
        const node = getComputedNode(nodeId).value;
        const removeNodeIds = [nodeId, ...getComputedDescendantNodes(node.id).value.map(n => n.id)];
        const removeEdgeIds = state.value.edges
            .filter(e => removeNodeIds.includes(e.source) || removeNodeIds.includes(e.target))
            .map(e => e.id);

        state.value.nodes = state.value.nodes.filter(n => !removeNodeIds.includes(n.id));
        state.value.edges = state.value.edges.filter(e => !removeEdgeIds.includes(e.id));
    };

    const reset = () => {
        console.log("clear history");
        state.value = {
            nodes: [],
            edges: []
        };
        history.commit();
        history.clear();
    };

    return {
        state,
        history,
        getComputedVueFlowNodes,
        getComputedVueFlowEdges,
        getComputedNode,
        getComputedTypedTensor,
        getComputedDeterministicValue,
        getComputedProbabilisticHistogramData,
        getComputedProbabilisticSeriesPlotData,
        getComputedDeterministicSeriesPlotData,
        getComputedAncestorNodes,
        getComputedDescendantNodes,
        getComputedVariableDependencies,
        addEdgeFromVueFlowConnectionAction,
        removeEdgeAction,
        updateNodePositionAction,
        updateNodeSizeAction,
        addNewNodeAction,
        removeNodeAction,
        reset
    };
});
