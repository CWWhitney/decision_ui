import { computed } from "vue";

import { type Connection as VueFlowConnection } from "@vue-flow/core";

import { defineStore } from "pinia";
import { useRefHistory, useSessionStorage } from "@vueuse/core";

import * as common from "@decision-support-ui/common";

import { useComputationStore } from "./computation";
import { makeSafeComputedGetterByKey } from "@/common/computed";

export const FLOW_GRAPH_STORE_ID = "graph";

export const useGraphStore = defineStore(FLOW_GRAPH_STORE_ID, () => {
    const computationStore = useComputationStore();
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
                mcRuns: computationStore.state.mcRuns
            }) as common.ComputationContext
    );

    const _nodesByIdMap = computed(() => common.getNodeByIdMap(state.value.nodes));
    const _nodeChildrenByParentId = computed(() => common.getNodeChildrenByParentIdMap(state.value.nodes));
    const _subgraphChildrenByParentId = computed(() => common.getSubgraphChildrenByParentIdMap(state.value.nodes));
    const _nodeIdByVariableMap = computed(() => {
        return new Map(
            state.value.nodes.filter(n => n.type == common.VARIABLE_NODE_TYPE).map(n => [n.function.variable, n.id])
        ) as Map<string, common.NodeId>;
    });

    const getComputedNode = makeSafeComputedGetterByKey<common.NodeId, common.Node>(
        (nodeId: common.NodeId) => common.getFromMapOrThrow(nodeId, _nodesByIdMap.value),
        (nodeId: common.NodeId) => `Node with id "${nodeId}" does not exist`
    );

    const getComputedNodeIdFromVariableName = makeSafeComputedGetterByKey<string, common.NodeId>(
        (variableName: string) => common.getFromMapOrThrow(variableName, _nodeIdByVariableMap.value),
        (variableName: string) => `Variable "${variableName}" is not known`
    );

    const isNodeIdValid = (nodeId: common.NodeId) => _nodesByIdMap.value.has(nodeId);
    const isVariableNameValid = (variableName: string) => _nodeIdByVariableMap.value.has(variableName);

    const getComputedNodePosition: (nodeId: common.NodeId) => common.Position = makeSafeComputedGetterByKey(
        (nodeId: common.NodeId) =>
            common.getNodePositionRecursion(
                nodeId,
                (nodeId: common.NodeId) => getComputedNode(nodeId),
                (nodeId: common.NodeId) => getComputedNodePosition(nodeId)
            )
    );

    const getComputedNodeAncestors: (nodeId: common.NodeId) => common.Node[] = makeSafeComputedGetterByKey(
        (nodeId: common.NodeId) =>
            common.getNodeAncestorsRecursion(
                getComputedNode(nodeId),
                (nodeId: common.NodeId) => getComputedNode(nodeId),
                (node: common.Node) => getComputedNodeAncestors(node.id)
            )
    );

    const getComputedNodeDescendants: (nodeId: common.NodeId) => common.Node[] = makeSafeComputedGetterByKey(
        (nodeId: common.NodeId) =>
            common.getNodeDescendantsRecursion(
                getComputedNode(nodeId),
                _nodeChildrenByParentId.value,
                (node: common.Node) => getComputedNodeDescendants(node.id)
            )
    );

    const getComputedSubgraphChildren = (nodeId: common.NodeId) => _subgraphChildrenByParentId.value.get(nodeId) ?? [];

    const getComputedSubgraphAncestors: (nodeId: common.NodeId) => common.Node[] = makeSafeComputedGetterByKey(
        (nodeId: common.NodeId) =>
            common.getSubgraphAncestorsRecursion(
                getComputedNode(nodeId),
                (nodeId: common.NodeId) => getComputedNode(nodeId),
                (node: common.Node) => getComputedSubgraphAncestors(node.id)
            )
    );

    const getComputedSubgraphDescendants: (nodeId: common.NodeId) => common.Node[] = makeSafeComputedGetterByKey(
        (nodeId: common.NodeId) =>
            common.getSubgraphDescendantsRecursion(
                getComputedNode(nodeId),
                _subgraphChildrenByParentId.value,
                (node: common.Node) => getComputedSubgraphDescendants(node.id)
            )
    );

    const getComputedAnyAncestors: (nodeId: common.NodeId) => common.Node[] = makeSafeComputedGetterByKey(
        (nodeId: common.NodeId) =>
            common.getAnyAncestorsRecursion(
                getComputedNode(nodeId),
                (nodeId: common.NodeId) => getComputedNode(nodeId),
                (node: common.Node) => getComputedAnyAncestors(node.id)
            )
    );

    const getComputedAnyDescendants: (nodeId: common.NodeId) => common.Node[] = makeSafeComputedGetterByKey(
        (nodeId: common.NodeId) =>
            common.getAnyDescendantsRecursion(
                getComputedNode(nodeId),
                _subgraphChildrenByParentId.value,
                _nodeChildrenByParentId.value,
                (node: common.Node) => getComputedAnyDescendants(node.id)
            )
    );

    const getComputedVariableDependencies: (nodeId: common.NodeId) => common.VariableDependencies =
        makeSafeComputedGetterByKey((nodeId: common.NodeId) => {
            const node = getComputedNode(nodeId);
            try {
                if (
                    node.function.type == common.OPERATION_FUNCTION_TYPE ||
                    node.function.type == common.RESULT_FUNCTION_TYPE
                ) {
                    return evaluateExpressionForVariableDependencies(node.function.expression);
                } else if (node.function.type == common.LOOP_FUNCTION_TYPE) {
                    return [
                        ...evaluateExpressionForVariableDependencies(node.function.iterationsExpression),
                        ...evaluateExpressionForVariableDependencies(node.function.initExpression),
                        ...evaluateExpressionForVariableDependencies(node.function.loopExpression)
                    ].filter(v => v !== "previous" && v !== "i");
                }
                return [];
            } catch {
                return [];
            }
        });

    const getComputedExpressionMatches: (nodeId: common.NodeId) => common.NodeFunctionExpressionMatches =
        makeSafeComputedGetterByKey((nodeId: common.NodeId) =>
            common.getExpressionMatchesForNode(getComputedNode(nodeId))
        );

    const getComputedTypedTensor: (nodeId: common.NodeId) => common.TypedTensor = makeSafeComputedGetterByKey(
        (nodeId: common.NodeId, previousTensor: common.TypedTensor | undefined) => {
            console.log(`start calculating tensor for node '${nodeId}'`);
            const started = +new Date();
            if (previousTensor) {
                previousTensor.tensor.dispose();
            }

            const result = common.getTypedTensorForNodeRecursion(
                nodeId,
                getComputedNode,
                getComputedVariableDependencies,
                getComputedNodeIdFromVariableName,
                getComputedExpressionMatches,
                evaluateExpressionMatch,
                getComputedTypedTensor,
                computedComputationContext.value
            );
            console.log(`calculated tensor for node ${nodeId} in ${+new Date() - started}ms`);
            return result;
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
        const node = getComputedNode(nodeId);
        if (node.visualization.position.x != position.x || node.visualization.position.y != position.y) {
            node.visualization.position = position;
        }
    };

    const updateNodeSizeAction = (nodeId: common.NodeId, size: common.Size) => {
        const node = getComputedNode(nodeId);
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
    ): common.Node => {
        const parentNodeId = options?.nodeParentId ?? null;
        const parentNode = parentNodeId ? getComputedNode(parentNodeId) : null;
        const ancestorNodes = parentNode ? getComputedNodeAncestors(parentNode.id) : [];
        const ancestorOffset = [parentNode, ...ancestorNodes].reduce(
            (p, n) => ({ x: p.x + (n?.visualization.position.x ?? 0), y: p.y + (n?.visualization.position.y ?? 0) }),
            { x: 0, y: 0 } as common.Position
        );
        const newNodeSize = common.getDefaultNodeSize(nodeType);
        const newNodePosition = {
            x: (options?.position?.x ?? 0) - newNodeSize.width / 2 - ancestorOffset.x,
            y: (options?.position?.y ?? 0) - newNodeSize.height / 2 - ancestorOffset.y
        };

        const newNode = common.getNewNode(title, nodeType, functionType, styleType, state.value.nodes, {
            ...options,
            position: newNodePosition
        });
        state.value.nodes = [...state.value.nodes, newNode];
        return newNode;
    };

    const removeNodeAction = (nodeId: common.NodeId) => {
        if (!isNodeIdValid(nodeId)) {
            console.warn(`skip removing node '${nodeId}', which might have already been deleted`);
            return;
        }
        const node = getComputedNode(nodeId);
        const descendantNodes = getComputedAnyDescendants(node.id);
        const removeNodeIds = [nodeId, ...descendantNodes.map(n => n.id)];
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
        isVariableNameValid,
        getComputedNodeIdFromVariableName,
        getComputedNodePosition,
        getComputedNode,
        getComputedTypedTensor,
        getComputedNodeAncestors,
        getComputedNodeDescendants,
        getComputedSubgraphChildren,
        getComputedSubgraphAncestors,
        getComputedSubgraphDescendants,
        getComputedAnyAncestors,
        getComputedAnyDescendants,
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
