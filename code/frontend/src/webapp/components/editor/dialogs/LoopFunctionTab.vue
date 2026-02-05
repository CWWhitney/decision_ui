<script setup lang="ts">
    /**
     * Functions Tab of the Node Edit Dialog for Nodes with Loop Function Type
     */

    import { type LoopNodeFunctionState, type AbstractNode, type VariableNodeType } from "@decision-support-ui/common";

    import ExpressionInput from "../expression/ExpressionInput.vue";
    import HelpHintWrapper from "../../form/HelpHintWrapper.vue";

    const node = defineModel<AbstractNode<VariableNodeType, LoopNodeFunctionState, any>>({ required: true });
</script>

<template>
    <div class="loopFunctionTabContainer">
        <HelpHintWrapper>
            <template #default>
                <ExpressionInput
                    v-model="node.function.iterationsExpression"
                    :empty-label="`Expression Loop Iterations `"
                    :filled-label="`Iterations =`"
                />
            </template>
            <template #tooltip>Test</template>
        </HelpHintWrapper>
        <HelpHintWrapper>
            <template #default>
                <ExpressionInput
                    v-model="node.function.initExpression"
                    :empty-label="`Expression for Initial Value (i = 0) `"
                    :filled-label="`${node.function.variable}[0] = `"
                />
            </template>
            <template #tooltip>Test</template>
        </HelpHintWrapper>
        <HelpHintWrapper>
            <template #default>
                <ExpressionInput
                    v-model="node.function.loopExpression"
                    :empty-label="`Expression for Iteration Value (i > 0)`"
                    :filled-label="`${node.function.variable}[i] = `"
                />
            </template>
            <template #tooltip>Test</template>
        </HelpHintWrapper>
    </div>
</template>

<style scoped lang="scss">
    .loopFunctionTabContainer {
        display: flex;
        flex-direction: column;
        gap: 1em;
    }
</style>
