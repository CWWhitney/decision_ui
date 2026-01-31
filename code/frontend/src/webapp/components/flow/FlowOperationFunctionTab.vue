<script setup lang="ts">
    import {
        type AbstractNode,
        type OperationNodeFunctionState,
        type ResultNodeFunctionState
    } from "@decision-support-ui/common";

    import FlowExpressionInput from "./FlowExpressionInput.vue";

    const node = defineModel<AbstractNode<OperationNodeFunctionState | ResultNodeFunctionState, any>>({
        required: true
    });
</script>

<template>
    <FlowExpressionInput v-model="node.function.expression" />
</template>
