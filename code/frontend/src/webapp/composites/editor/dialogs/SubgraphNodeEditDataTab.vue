<script setup lang="ts">
    import { useGraphStore } from "@/state/graph";
    import { VARIABLE_NODE_TYPE, type Node, type NodeId } from "@decision-support-ui/common";
    import TypedTensorVisualization from "@/components/editor/dialogs/TypedTensorVisualization.vue";
    import { useComputationStore } from "@/state/computation";
    import { computedAsync } from "@vueuse/core";
    import { sleep } from "@/common/async";
    import { UI_REFRESH_SLEEP_TIMEOUT } from "@/common/constants";
    import { computed, ref } from "vue";
    import {
        catchForComputedResult,
        COMPUTED_RESULT_ERROR_TYPE,
        COMPUTED_RESULT_SUCCESS_TYPE
    } from "@/common/computed";
    import { watch } from "vue";
    import HelpHintWrapper from "@/components/form/HelpHintWrapper.vue";

    const node = defineModel<Node>({ required: true });
    const graphStore = useGraphStore();
    const computation = useComputationStore();

    const childVariableNodes = computed(() =>
        graphStore.getComputedSubgraphChildren(node.value.id).filter(n => n.type == VARIABLE_NODE_TYPE)
    );

    const childNodeSelectItems = computed(() =>
        childVariableNodes.value.map(n => ({
            title: n.visualization.title,
            value: n.id
        }))
    );

    const selectedChildNodeId = ref<NodeId | null>(null);

    watch(
        childVariableNodes,
        () => {
            const childNodeIdSet = new Set<NodeId>(childVariableNodes.value.map(n => n.id));
            if (
                childNodeIdSet.size > 0 &&
                (selectedChildNodeId.value == null || !childNodeIdSet.has(selectedChildNodeId.value))
            ) {
                selectedChildNodeId.value = childVariableNodes.value[0]!.id;
            }
        },
        { immediate: true }
    );

    const selectedChildNode = computed(() => {
        if (selectedChildNodeId.value) {
            return graphStore.getComputedNode(selectedChildNodeId.value);
        }
        return null;
    });

    const computedTypeTensorLoading = ref<boolean>(false);

    const computedTypedTensorResult = computedAsync(
        async () => {
            const _selectedChildNode = selectedChildNode.value;
            if (_selectedChildNode) {
                console.debug(`refresh subgraph data tab with seed ${computation.transient.seed}`);
                await sleep(UI_REFRESH_SLEEP_TIMEOUT);
                return catchForComputedResult(() => graphStore.getComputedTypedTensor(_selectedChildNode.id));
            }
        },
        null,
        computedTypeTensorLoading
    );
</script>

<template>
    <div class="subgraphDataTabContainer">
        <p>Select a node from this subgraph to visualize the data of its variable:</p>
        <HelpHintWrapper>
            <template #default
                ><v-select
                    v-model="selectedChildNodeId"
                    :items="childNodeSelectItems"
                    label="Subgraph Node"
                    :disabled="childNodeSelectItems.length == 0"
                    hide-details
            /></template>
            <template #tooltip
                >Select one of the subgraph's direct child nodes that define variables to view their data. Only the
                immediate children are available, though. Nodes nested in further subgraphs are not listed.</template
            >
        </HelpHintWrapper>
        <p v-if="selectedChildNode != null">
            The value of node "{{ selectedChildNode.visualization.title }}" is evaluated to the data depicted below:
        </p>
        <template v-if="computedTypeTensorLoading">
            <div class="loading">
                <v-progress-circular indeterminate></v-progress-circular>
            </div>
        </template>
        <template v-else>
            <div
                v-if="
                    selectedChildNode &&
                    computedTypedTensorResult &&
                    computedTypedTensorResult.type == COMPUTED_RESULT_SUCCESS_TYPE
                "
                class="visualization"
            >
                <TypedTensorVisualization
                    :node-title="selectedChildNode.visualization.title"
                    :tt="computedTypedTensorResult.value"
                    :bins="computation.persisted.histogramBins"
                />
            </div>
            <div v-if="computedTypedTensorResult && computedTypedTensorResult.type == COMPUTED_RESULT_ERROR_TYPE">
                <v-alert
                    type="error"
                    variant="outlined"
                    :text="`Computation Error: ${computedTypedTensorResult.message}`"
                />
            </div>
        </template>
    </div>
</template>

<style scoped lang="scss">
    .subgraphDataTabContainer {
        flex-grow: 1;
        display: flex;
        width: 100%;
        height: 100%;
        flex-direction: column;
        gap: 1em;

        :deep(p) {
            margin: 0;
        }
    }

    .loading {
        flex-grow: 1;
        display: flex;
        width: 100%;
        height: 100%;
        justify-content: center;
        align-items: center;
        min-height: 20em;
    }

    .visualization {
        display: flex;
        flex-grow: 1;
        flex-direction: column;
        width: 100%;
        min-height: 20em;
    }
</style>
