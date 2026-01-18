<script setup lang="ts">
    import { useFlowGraphStore } from "@/state/flow/graph";
    import { DETERMINISTIC_TYPE, PROBABILISTIC_TYPE, SERIES_TYPE, type Node } from "@decision-support-ui/common";
    import FlowVisualizeDeterministicValue from "./FlowVisualizeDeterministicValue.vue";
    import FlowVisualizeProbabilisticValue from "./FlowVisualizeProbabilisticValue.vue";
    import { computedAsync } from "@vueuse/core";

    const node = defineModel<Node>({ required: true });
    const graphStore = useFlowGraphStore();

    const computedTensorDescriptor = graphStore.getComputedTensorDescriptor(node.value.id);

    const computedDeterministicValue = computedAsync(async () => {
        if (
            computedTensorDescriptor.value.type == "success" &&
            computedTensorDescriptor.value.value.type == DETERMINISTIC_TYPE
        ) {
            return await graphStore.getComputedDeterministicValue(node.value.id).value;
        }
    });

    const computedProbabilisticHistogramData = computedAsync(async () => {
        if (
            computedTensorDescriptor.value.type == "success" &&
            computedTensorDescriptor.value.value.type == PROBABILISTIC_TYPE
        ) {
            return await graphStore.getComputedProbabilisticHistogramData(node.value.id).value;
        }
    });
</script>

<template>
    <div v-if="computedTensorDescriptor.type == 'success'" class="container">
        <div v-if="computedDeterministicValue && computedDeterministicValue.type == 'success'">
            <FlowVisualizeDeterministicValue :value="computedDeterministicValue.value" />
        </div>
        <div v-if="computedProbabilisticHistogramData && computedProbabilisticHistogramData.type == 'success'">
            <FlowVisualizeProbabilisticValue
                :bins="computedProbabilisticHistogramData.value.bins"
                :counts="computedProbabilisticHistogramData.value.counts"
            />
        </div>
        <div v-if="computedTensorDescriptor.value.type == SERIES_TYPE">
            <!-- visualize series value -->
        </div>
    </div>
</template>

<style scoped lang="scss">
    .container {
        min-width: 25em;
    }
</style>
