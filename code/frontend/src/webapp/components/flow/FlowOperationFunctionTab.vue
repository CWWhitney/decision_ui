<script setup lang="ts">
    import {
        type AbstractNode,
        type OperationNodeFunctionState,
        type ResultNodeFunctionState,
        type VariableNodeType
    } from "@decision-support-ui/common";

    import FlowExpressionInput from "./FlowExpressionInput.vue";
    import HelpHintWrapper from "./HelpHintWrapper.vue";

    const node = defineModel<AbstractNode<VariableNodeType, OperationNodeFunctionState | ResultNodeFunctionState, any>>(
        {
            required: true
        }
    );
</script>

<template>
    <p>The value of this node is determined by the following mathematical expression:</p>
    <HelpHintWrapper to="/help/user-interface/model-editor">
        <template #default>
            <FlowExpressionInput
                v-model="node.function.expression"
                :empty-label="`Expression for Variable`"
                :filled-label="`${node.function.variable} = `"
            />
        </template>
        <template #tooltip
            >Please enter the mathematical formula that determines the value of this node's variable '{{
                node.function.variable
            }}'. Clicking inside the input field will show all available mathematical operators and functions.
        </template>
    </HelpHintWrapper>
</template>
