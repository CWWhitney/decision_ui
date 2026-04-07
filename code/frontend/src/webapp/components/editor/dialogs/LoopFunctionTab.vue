<script setup lang="ts">
    /**
     * Functions Tab of the Node Edit Dialog for Nodes with Loop Function Type
     */

    import { type LoopNodeFunctionState, type AbstractNode, type VariableNodeType } from "@decision-support-ui/common";

    import ExpressionInput from "../expression/ExpressionInput.vue";
    import HelpHintWrapper from "../../form/HelpHintWrapper.vue";

    const node = defineModel<AbstractNode<VariableNodeType, LoopNodeFunctionState, any>>({ required: true });

    const props = withDefaults(
        defineProps<{
            knownVariables?: string[];
        }>(),
        {
            knownVariables: () => []
        }
    );
</script>

<template>
    <div class="loopFunctionTabContainer">
        <HelpHintWrapper to="/help/user-interface/model-editor/node-edit-dialog/formula-expression-input">
            <template #default>
                <ExpressionInput
                    v-model="node.function.iterationsExpression"
                    :empty-label="`Expression Loop Iterations `"
                    :filled-label="`Iterations =`"
                    :known-variables="props.knownVariables"
                />
            </template>
            <template #tooltip
                ><p>
                    This expression defines the length of the time series and controls how often this loop is evaluated.
                    Usually, this corresponds, e.g., to a certain number of years, months or days.
                </p>
                <p>
                    This expression needs to evaluate to a deterministic integer value, meaning, a constant number.
                    Fractions or probabilistic values are not allowed.
                </p>
            </template>
        </HelpHintWrapper>
        <HelpHintWrapper to="/help/user-interface/model-editor/node-edit-dialog/formula-expression-input">
            <template #default>
                <ExpressionInput
                    v-model="node.function.initExpression"
                    :empty-label="`Expression for Initial Value (i = 1) `"
                    :filled-label="`${node.function.variable}[1] = `"
                    :known-variables="props.knownVariables"
                />
            </template>
            <template #tooltip>
                <p>
                    The initial expression defines the value of this variable at time step 1. It is evaluated only once.
                </p>
                <p>
                    This expression supports the loop index variable <code>i</code>, which is replace with the value 1.
                    In addition, other time series variables defined in other loop nodes can be accessed using the index
                    notations <code>other[i]</code>.
                </p>
            </template>
        </HelpHintWrapper>
        <HelpHintWrapper to="/help/user-interface/model-editor/node-edit-dialog/formula-expression-input">
            <template #default>
                <ExpressionInput
                    v-model="node.function.loopExpression"
                    :empty-label="`Expression for Iteration Value (i > 1)`"
                    :filled-label="`${node.function.variable}[i] = `"
                    :known-variables="props.knownVariables"
                />
            </template>
            <template #tooltip>
                <p>
                    The iteration expression is evaluated for every time step larger than 1. It is evaluated multiple
                    times and defines the value of this variable for indexes
                    <code>i = 2,3,4 ... (iterations-1)</code>.
                </p>
                <p>This expression supports two addtional variables:</p>
                <ul>
                    <li><code>i</code> is replaced with the current index value 2,3,4 ...</li>
                    <li>
                        <code>previous</code> is replaced with the value of the previous time step (otherwise known as
                        <code>variable[i-1]</code>)
                    </li>
                </ul>
                <p>
                    In addition, other time series variables defined in other loop nodes can be accessed using the index
                    notations <code>other[i]</code> and <code>other[i-1]</code>
                </p>
                <p>
                    This expression may only evaluate to deterministic or probabilistic data, but not a time series
                    itself. For example, using the "vv" (value varier) function would lead to 2-dimensional data, which
                    is not supported.
                </p>
            </template>
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
