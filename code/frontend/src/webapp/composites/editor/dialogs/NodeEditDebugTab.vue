<script setup lang="ts">
    import { memory } from "@tensorflow/tfjs";

    import { useGraphStore } from "@/state/graph";
    import * as common from "@decision-support-ui/common";
    import { computed } from "vue";
    import { computedAsync } from "@vueuse/core";
    import { sleep } from "@/common/async";
    import { catchForComputedResult, COMPUTED_RESULT_SUCCESS_TYPE } from "@/common/computed";
    import { UI_REFRESH_SLEEP_TIMEOUT } from "@/common/constants";

    const node = defineModel<common.Node>({ required: true });
    const graphStore = useGraphStore();

    const variableDependencies = computed(() => {
        try {
            return graphStore.getComputedVariableDependencies(node.value.id);
        } catch {
            return [];
        }
    });

    const computedTypedTensorResult = computedAsync(async () => {
        await sleep(UI_REFRESH_SLEEP_TIMEOUT);
        return catchForComputedResult(() => graphStore.getComputedTypedTensor(node.value.id));
    });
</script>

<template>
    <p>
        Variable Dependencies: <br />
        {{ JSON.stringify(variableDependencies, null, 2) }}
    </p>
    <div v-if="computedTypedTensorResult && computedTypedTensorResult.type == COMPUTED_RESULT_SUCCESS_TYPE">
        <p>Computed Tensor:</p>
        <pre>{{
            JSON.stringify(
                {
                    shape: JSON.stringify(computedTypedTensorResult.value.tensor.shape),
                    dtype: computedTypedTensorResult.value.tensor.dtype,
                    isProbabilistic: computedTypedTensorResult.value.isProbabilistic,
                    isSeries: computedTypedTensorResult.value.isSeries
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
