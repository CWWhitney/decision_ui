<script setup lang="ts">
    import { debounce } from "@/common/throttle";
    import { AVAILABLE_DISTRIBUTIONS } from "@/editor/distributions";
    import { useFlowGraphStore } from "@/state/flow/graph";
    import {
        ESTIMATE_NODE_TYPE,
        getExpressionError,
        LOOP_NODE_TYPE,
        LOOP_OPERATION_NODE_TYPE,
        OPERATION_NODE_TYPE,
        RESULT_NODE_TYPE,
        type Node
    } from "@decision-support-ui/common";
    import { computed, ref, watch } from "vue";

    import FlowLoopNodeFunctionTab from "../components/flow/FlowLoopNodeFunctionTab.vue";
    import FlowLoopOperationNodeFunctionTab from "../components/flow/FlowLoopOperationNodeFunctionTab.vue";

    const node = defineModel<Node>({ required: true });
    const graphStore = useFlowGraphStore();

    const nodeWithExpressionInputValue = ref<string | null>(
        node.value.type == OPERATION_NODE_TYPE || node.value.type == RESULT_NODE_TYPE
            ? node.value.options.expression
            : null
    );

    const estimateNodeDeterministicValue = computed({
        get() {
            if (node.value.type == ESTIMATE_NODE_TYPE) {
                return node.value.options.lower;
            }
            return null;
        },
        set(value: number) {
            if (node.value.type == ESTIMATE_NODE_TYPE) {
                node.value.options.lower = value;
                node.value.options.upper = value;
            }
        }
    });

    const expressionOfNodeWithExpression = computed(() => {
        if (node.value.type == OPERATION_NODE_TYPE || node.value.type == RESULT_NODE_TYPE) {
            return node.value.options.expression;
        }
        return null;
    });

    watch(expressionOfNodeWithExpression, value => {
        nodeWithExpressionInputValue.value = value;
    });

    watch(
        nodeWithExpressionInputValue,
        debounce((value: string | null) => {
            if ((node.value.type == OPERATION_NODE_TYPE || node.value.type == RESULT_NODE_TYPE) && value) {
                graphStore.setNodeExpressionAction(node.value.id, value);
            }
        }, 300)
    );

    const expressionError = computed(() => {
        const expression = expressionOfNodeWithExpression.value;
        if (expression) {
            return getExpressionError(expression);
        }
        return null;
    });

    const appendToExpression = (text: string) => {
        nodeWithExpressionInputValue.value = `${nodeWithExpressionInputValue.value}${text}`;
    };

    const computedTypedTensor = graphStore.getComputedTypedTensor(node.value.id);

    const nodeType = ref<string>();
</script>

<template>
    <div>
        <h4>Function Type</h4>
        <div>
            <v-btn-toggle v-model="nodeType" divided border variant="text" color="primary">
                <v-btn prepend-icon="mdi-tilde" text="Estimate" />
                <v-btn prepend-icon="mdi-plus-minus" text="Operation" />
                <v-btn prepend-icon="mdi-repeat" text="Loop Operation" disabled />
            </v-btn-toggle>
        </div>
    </div>
    <h4>Options</h4>
    <div v-if="node.type == ESTIMATE_NODE_TYPE">
        <v-text-field
            v-model="graphStore.getComputedVariableName(node.id).value"
            label="Variable Name"
            disabled
        ></v-text-field>
        <v-combobox
            v-model="node.options.distribution"
            label="Distribution"
            :items="AVAILABLE_DISTRIBUTIONS"
        ></v-combobox>
        <div v-if="node.options.distribution != 'deterministic'" class="lower-upper-inputs">
            <v-number-input
                v-model="node.options.lower"
                :precision="null"
                label="Lower"
                control-variant="split"
            ></v-number-input>
            <v-number-input
                v-model="node.options.upper"
                :precision="null"
                label="Upper"
                control-variant="split"
            ></v-number-input>
        </div>
        <div v-else>
            <v-number-input
                v-model="estimateNodeDeterministicValue"
                :precision="null"
                label="Value"
                control-variant="split"
            ></v-number-input>
        </div>
    </div>
    <div v-if="node.type == OPERATION_NODE_TYPE">
        <v-text-field
            v-model="graphStore.getComputedVariableName(node.id).value"
            label="Variable Name"
            disabled
        ></v-text-field>
        <v-btn-group>
            <v-tooltip location="bottom" text="add chance event function" open-delay="500">
                <template #activator="{ props }">
                    <v-btn
                        v-bind="props"
                        variant="outlined"
                        size="x-small"
                        text="ce"
                        @click="
                            appendToExpression(
                                'chance_event(chance, value_if, value_if_not, n, cv_if, cv_if_not, one_draw)'
                            )
                        "
                    ></v-btn>
                </template>
            </v-tooltip>
            <v-tooltip location="bottom" text="add value varier function" open-delay="500">
                <template #activator="{ props }">
                    <v-btn
                        v-bind="props"
                        variant="outlined"
                        size="x-small"
                        text="vv"
                        @click="
                            appendToExpression(
                                'vv(mean, cv, n, absolute_trend, relative_trend, lower_limit, upper_limit)'
                            )
                        "
                    ></v-btn>
                </template>
            </v-tooltip>
            <v-tooltip location="bottom" text="add net present value function" open-delay="500">
                <template #activator="{ props }">
                    <v-btn
                        v-bind="props"
                        variant="outlined"
                        size="x-small"
                        text="npv"
                        @click="appendToExpression('npv(x, discount)')"
                    ></v-btn>
                </template>
            </v-tooltip>
            <v-divider vertical></v-divider>
            <v-tooltip location="bottom" text="add absolute value function" open-delay="500">
                <template #activator="{ props }">
                    <v-btn
                        v-bind="props"
                        variant="outlined"
                        size="x-small"
                        text="abs"
                        @click="appendToExpression('abs(x)')"
                    ></v-btn>
                </template>
            </v-tooltip>
            <v-tooltip location="bottom" text="add logarithm function" open-delay="500">
                <template #activator="{ props }">
                    <v-btn
                        v-bind="props"
                        variant="outlined"
                        size="x-small"
                        text="log"
                        @click="appendToExpression('log(x)')"
                    ></v-btn>
                </template>
            </v-tooltip>
            <v-tooltip location="bottom" text="add exponential function" open-delay="500">
                <template #activator="{ props }">
                    <v-btn
                        v-bind="props"
                        variant="outlined"
                        size="x-small"
                        text="exp"
                        @click="appendToExpression('exp(x)')"
                    ></v-btn>
                </template>
            </v-tooltip>
            <v-tooltip location="bottom" text="add round function" open-delay="500">
                <template #activator="{ props }">
                    <v-btn
                        v-bind="props"
                        variant="outlined"
                        size="x-small"
                        text="round"
                        @click="appendToExpression('round(x)')"
                    ></v-btn>
                </template>
            </v-tooltip>
        </v-btn-group>
        <v-text-field v-model="nodeWithExpressionInputValue" label="Expression or Formula" single-line></v-text-field>
        <v-alert v-if="!!expressionError" color="error" :text="expressionError" />
        <v-alert v-if="computedTypedTensor.type == 'error'" color="error" :text="computedTypedTensor.message" />
    </div>
    <div v-if="node.type == LOOP_NODE_TYPE">
        <FlowLoopNodeFunctionTab v-model="node" />
    </div>
    <div v-if="node.type == LOOP_OPERATION_NODE_TYPE">
        <FlowLoopOperationNodeFunctionTab
            v-model="node"
            :variable-name="graphStore.getComputedVariableName(node.id).value"
        />
    </div>
    <div v-if="node.type == RESULT_NODE_TYPE">
        <v-text-field
            v-model="graphStore.getComputedVariableName(node.id).value"
            label="Variable Name"
            disabled
        ></v-text-field>
        <v-text-field v-model="nodeWithExpressionInputValue" label="Expression or Formula"></v-text-field>
        <v-alert v-if="!!expressionError" color="error" :text="expressionError" />
    </div>
</template>

<style scoped lang="scss">
    .v-text-field {
        min-width: 25em;
    }

    .v-number-input {
        min-width: 15em;
    }

    .lower-upper-inputs {
        display: flex;
        gap: 1em;
    }

    h4 {
        font-weight: normal;
        margin-bottom: 0.5em;
        text-transform: uppercase;

        &:not(:first-child) {
            margin-top: 1em;
        }
    }
</style>
