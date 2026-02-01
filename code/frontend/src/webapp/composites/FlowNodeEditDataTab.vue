<script setup lang="ts">
    import { useFlowGraphStore } from "@/state/flow/graph";
    import { useProjectSettingsStore } from "@/state/projects/settings";
    import { type Node } from "@decision-support-ui/common";
    import FlowVisualizeTypedTensor from "@/components/flow/FlowVisualizeTypedTensor.vue";

    const node = defineModel<Node>({ required: true });
    const graphStore = useFlowGraphStore();
    const projectSettingsStore = useProjectSettingsStore();
    const computedTypedTensor = graphStore.getComputedTypedTensor(node.value.id);
</script>

<template>
    <div v-if="computedTypedTensor.type == 'success'" class="container">
        <FlowVisualizeTypedTensor
            :node-title="node.visualization.title"
            :tt="computedTypedTensor.value"
            :bins="projectSettingsStore.histogramBins"
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
