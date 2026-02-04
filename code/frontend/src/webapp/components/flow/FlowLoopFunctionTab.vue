<script setup lang="ts">
    /**
     * Functions Tab of the Node Edit Dialog for Nodes with Loop Function Type
     */

    import { type LoopNodeFunctionState, type AbstractNode, type VariableNodeType } from "@decision-support-ui/common";

    import FlowExpressionInput from "./FlowExpressionInput.vue";

    const node = defineModel<AbstractNode<VariableNodeType, LoopNodeFunctionState, any>>({ required: true });
</script>

<template>
    <div class="container">
        <FlowExpressionInput
            v-model="node.function.iterationsExpression"
            :empty-label="`Expression Loop Iterations `"
            :filled-label="`Iterations =`"
        />
        <FlowExpressionInput
            v-model="node.function.initExpression"
            :empty-label="`Expression for Initial Value (i = 0) `"
            :filled-label="`${node.function.variable}[0] = `"
        />
        <FlowExpressionInput
            v-model="node.function.loopExpression"
            :empty-label="`Expression for Iteration Value (i > 0)`"
            :filled-label="`${node.function.variable}[i] = `"
        />
    </div>
</template>

<style scoped lang="scss">
    .container {
        display: flex;
        flex-direction: column;
        gap: 1em;
    }
</style>
