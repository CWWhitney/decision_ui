<script setup lang="ts">
    import { memory } from "@tensorflow/tfjs";

    import { useFlowGraphStore } from "@/state/flow/graph";
    import { type Node } from "@decision-support-ui/common";
    import { computedAsync } from "@vueuse/core";
    import { computed } from "vue";

    const node = defineModel<Node>({ required: true });
    const graphStore = useFlowGraphStore();

    const variableDependencies = computed(() => graphStore.getComputedVariableDependencies(node.value.id).value);
    const computedTypedTensor = computedAsync(async () => await graphStore.getComputedTypedTensor(node.value.id).value);
</script>

<template>
    <p v-if="variableDependencies && variableDependencies.type == 'success'">
        Variable Dependencies: <br />
        {{ JSON.stringify(variableDependencies.value, null, 2) }}
    </p>
    <div v-if="computedTypedTensor && computedTypedTensor.type == 'success'">
        <p>Computed Tensor:</p>
        <pre>{{
            JSON.stringify(
                {
                    shape: JSON.stringify(computedTypedTensor.value.tensor.shape),
                    dtype: computedTypedTensor.value.tensor.dtype,
                    // tensor: computedTypedTensor.value.tensor.toString().replace("Tensor\n    ", ""),
                    isProbabilistic: computedTypedTensor.value.isProbabilistic,
                    isSeries: computedTypedTensor.value.isSeries
                },
                null,
                2
            )
        }}</pre>
    </div>
    <p>Tensorflow Memory:</p>
    <pre>{{ JSON.stringify(memory(), null, 2) }}</pre>
</template>

<style scoped lang="scss"></style>
