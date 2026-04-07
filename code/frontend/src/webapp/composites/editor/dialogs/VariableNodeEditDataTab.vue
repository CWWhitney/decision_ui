<script setup lang="ts">
    import { ref } from "vue";
    import { computedAsync } from "@vueuse/core";
    import { type Node } from "@decision-support-ui/common";

    import { useGraphStore } from "../../../state/graph";
    import { useComputationStore } from "../../../state/computation";
    import { sleep } from "../../../common/async";
    import { UI_REFRESH_SLEEP_TIMEOUT } from "../../../common/constants";
    import {
        catchForComputedResult,
        COMPUTED_RESULT_ERROR_TYPE,
        COMPUTED_RESULT_SUCCESS_TYPE
    } from "../../../common/computed";

    import TypedTensorVisualization from "../../../components/editor/dialogs/TypedTensorVisualization.vue";

    const node = defineModel<Node>({ required: true });
    const graphStore = useGraphStore();
    const computation = useComputationStore();

    const computedTypeTensorLoading = ref<boolean>(false);

    const computedTypedTensorResult = computedAsync(
        async () => {
            console.debug(`refresh variable data tab with seed ${computation.transient.seed}`);
            await sleep(UI_REFRESH_SLEEP_TIMEOUT);
            return catchForComputedResult(() => graphStore.getComputedTypedTensor(node.value.id));
        },
        null,
        computedTypeTensorLoading
    );
</script>

<template>
    <p>The value of this node is evaluated to the data visualized below:</p>
    <template v-if="computedTypeTensorLoading">
        <div class="loading">
            <v-progress-circular indeterminate></v-progress-circular>
        </div>
    </template>
    <template v-else>
        <div
            v-if="computedTypedTensorResult && computedTypedTensorResult.type == COMPUTED_RESULT_SUCCESS_TYPE"
            class="visualization"
        >
            <TypedTensorVisualization
                :node-title="node.visualization.title"
                :tt="computedTypedTensorResult.value"
                :bins="computation.persisted.frontend.histogramBins"
            />
        </div>
        <div v-if="computedTypedTensorResult && computedTypedTensorResult.type == COMPUTED_RESULT_ERROR_TYPE">
            <v-alert type="error" variant="outlined" :text="`${computedTypedTensorResult.message}`" />
        </div>
    </template>
</template>

<style scoped lang="scss">
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
