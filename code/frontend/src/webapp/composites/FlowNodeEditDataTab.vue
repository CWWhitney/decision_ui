<script setup lang="ts">
    import { useFlowGraphStore } from "@/state/flow/graph";
    import { type Node } from "@decision-support-ui/common";
    import FlowVisualizeTypedTensor from "@/components/flow/FlowVisualizeTypedTensor.vue";

    const node = defineModel<Node>({ required: true });
    const graphStore = useFlowGraphStore();

    const computedTypedTensor = graphStore.getComputedTypedTensor(node.value.id);

    const getDeterministicValue = () => graphStore.getComputedDeterministicValue(node.value.id).value;
    const getHistogramData = () => graphStore.getComputedProbabilisticHistogramData(node.value.id).value;
    const getProbabilisticSeriesPlotData = () => graphStore.getComputedProbabilisticSeriesPlotData(node.value.id).value;
    const getDeterministicSeriesPlotData = () => graphStore.getComputedDeterministicSeriesPlotData(node.value.id).value;
</script>

<template>
    <div v-if="computedTypedTensor.type == 'success'" class="container">
        <FlowVisualizeTypedTensor
            :node-title="node.visualization.title"
            :is-probabilistic="computedTypedTensor.value.isProbabilistic"
            :is-series="computedTypedTensor.value.isSeries"
            :get-deterministic-value="getDeterministicValue"
            :get-histogram-data="getHistogramData"
            :get-probabilistic-series-plot-data="getProbabilisticSeriesPlotData"
            :get-deterministic-series-plot-data="getDeterministicSeriesPlotData"
        />
    </div>
    <div v-if="computedTypedTensor.type == 'error'">
        <v-alert type="error" :text="`Computation Error: ${computedTypedTensor.message}`" />
    </div>
</template>

<style scoped lang="scss">
    .container {
        display: flex;
        flex-grow: 1;
        flex-direction: column;
        width: 100%;
    }
</style>
