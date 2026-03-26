<script lang="ts" setup>
    import { useGraphStore } from "@/state/graph";
    import { computed } from "vue";
    import * as common from "@decision-support-ui/common";
    import { catchForComputedResult, COMPUTED_RESULT_ERROR_TYPE } from "@/common/computed";
    import { useAccountStore } from "@/state/account";

    const graph = useGraphStore();
    const account = useAccountStore();

    const resultNodeIds = computed(() =>
        graph.state.nodes
            .filter(n => n.type == common.VARIABLE_NODE_TYPE && n.function.type == common.RESULT_FUNCTION_TYPE)
            .map(n => n.id)
    );

    const noResultNodes = computed(() => resultNodeIds.value.length == 0);

    const computationError = computed(() => {
        const errors = resultNodeIds.value
            .map(nodeId => catchForComputedResult(() => graph.getComputedTypedTensor(nodeId)))
            .filter(r => r.type == COMPUTED_RESULT_ERROR_TYPE);

        return errors.length > 0 ? errors[0]?.message : null;
    });
</script>

<template>
    <div>
        <v-alert v-if="!!computationError" type="error" variant="outlined">{{ computationError }}</v-alert>
        <v-alert v-else-if="noResultNodes" type="info" variant="outlined"
            >You need to add at least one result node to your model.</v-alert
        >
        <v-alert v-else-if="!account.isLoggedIn" type="info" variant="outlined"
            >You need to login in order to run your model in the R backend.</v-alert
        >
    </div>
</template>
