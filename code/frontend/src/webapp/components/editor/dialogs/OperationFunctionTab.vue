<script setup lang="ts">
    import {
        type AbstractNode,
        type OperationNodeFunctionState,
        type ResultNodeFunctionState,
        type VariableNodeType
    } from "@decision-support-ui/common";

    import ExpressionInput from "../expression/ExpressionInput.vue";
    import HelpHintWrapper from "../../form/HelpHintWrapper.vue";
    import type { KnownVariablesInfo } from "../expression/ExpressionCodeMirror.vue";

    const node = defineModel<AbstractNode<VariableNodeType, OperationNodeFunctionState | ResultNodeFunctionState, any>>(
        {
            required: true
        }
    );

    const props = withDefaults(
        defineProps<{
            knownVariables?: KnownVariablesInfo[];
        }>(),
        {
            knownVariables: () => []
        }
    );
</script>

<template>
    <p>The value of this node is determined by the following mathematical expression:</p>
    <HelpHintWrapper to="/help/user-interface/model-editor/node-edit-dialog/formula-expression-input">
        <template #default>
            <ExpressionInput
                v-model="node.function.expression"
                :empty-label="`Expression for Variable`"
                :filled-label="`${node.function.variable} = `"
                :known-variables="props.knownVariables"
            />
        </template>
        <template #tooltip>
            Please enter the mathematical formula that determines the value of this node's variable '{{
                node.function.variable
            }}'. Clicking inside the input field will show all available mathematical operators and functions. You can
            use <code>CTRL + SPACE</code> to list available variables and functions.
        </template>
    </HelpHintWrapper>
</template>
