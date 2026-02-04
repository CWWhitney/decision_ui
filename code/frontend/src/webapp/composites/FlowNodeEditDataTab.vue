<script setup lang="ts">
    import { useFlowGraphStore } from "@/state/graph";
    import { type Node } from "@decision-support-ui/common";
    import FlowVisualizeTypedTensor from "@/components/flow/FlowVisualizeTypedTensor.vue";
    import { useComputationSettingsStore } from "@/state/settings";

    const node = defineModel<Node>({ required: true });
    const graphStore = useFlowGraphStore();
    const computationSettings = useComputationSettingsStore();
    const computedTypedTensor = graphStore.getComputedTypedTensor(node.value.id);
</script>

<template>
    <p>The value of this node is evaluated to the data visualized below:</p>
    <div v-if="computedTypedTensor.type == 'success'" class="container">
        <FlowVisualizeTypedTensor
            :node-title="node.visualization.title"
            :tt="computedTypedTensor.value"
            :bins="computationSettings.histogramBins"
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
