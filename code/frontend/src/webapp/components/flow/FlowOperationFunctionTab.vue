<script setup lang="ts">
    /**
     * Functions Tab of the Node Edit Dialog for Nodes with Operation or Result Function Type
     */
    import { debounce } from "@/common/throttle";
    import {
        getExpressionError,
        type AbstractNode,
        type OperationNodeFunctionState,
        type ResultNodeFunctionState
    } from "@decision-support-ui/common";
    import { computed, ref, watch } from "vue";

    const node = defineModel<AbstractNode<OperationNodeFunctionState | ResultNodeFunctionState, any>>({
        required: true
    });
    const props = defineProps({
        debounceTime: {
            type: Number,
            default: 300,
            required: false
        }
    });

    const expressionInputValue = ref<string>(node.value.function.expression);
    const expression = computed(() => node.value.function.expression);

    watch(expression, value => {
        expressionInputValue.value = value;
    });

    watch(
        expressionInputValue,
        debounce((value: string) => {
            node.value.function.expression = value;
        }, props.debounceTime)
    );

    const expressionError = computed(() => {
        if (expression.value) {
            return getExpressionError(expression.value);
        }
        return null;
    });

    const appendToExpression = (text: string) => {
        expressionInputValue.value = `${expressionInputValue.value}${text}`;
    };
</script>

<template>
    <v-btn-group>
        <v-tooltip location="bottom" text="add chance event function" open-delay="500">
            <template #activator="{ props: tooltipProps }">
                <v-btn
                    v-bind="tooltipProps"
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
            <template #activator="{ props: tooltipProps }">
                <v-btn
                    v-bind="tooltipProps"
                    variant="outlined"
                    size="x-small"
                    text="vv"
                    @click="
                        appendToExpression('vv(mean, cv, n, absolute_trend, relative_trend, lower_limit, upper_limit)')
                    "
                ></v-btn>
            </template>
        </v-tooltip>
        <v-tooltip location="bottom" text="add net present value function" open-delay="500">
            <template #activator="{ props: tooltipProps }">
                <v-btn
                    v-bind="tooltipProps"
                    variant="outlined"
                    size="x-small"
                    text="npv"
                    @click="appendToExpression('npv(x, discount)')"
                ></v-btn>
            </template>
        </v-tooltip>
        <v-divider vertical></v-divider>
        <v-tooltip location="bottom" text="add absolute value function" open-delay="500">
            <template #activator="{ props: tooltipProps }">
                <v-btn
                    v-bind="tooltipProps"
                    variant="outlined"
                    size="x-small"
                    text="abs"
                    @click="appendToExpression('abs(x)')"
                ></v-btn>
            </template>
        </v-tooltip>
        <v-tooltip location="bottom" text="add logarithm function" open-delay="500">
            <template #activator="{ props: tooltipProps }">
                <v-btn
                    v-bind="tooltipProps"
                    variant="outlined"
                    size="x-small"
                    text="log"
                    @click="appendToExpression('log(x)')"
                ></v-btn>
            </template>
        </v-tooltip>
        <v-tooltip location="bottom" text="add exponential function" open-delay="500">
            <template #activator="{ props: tooltipProps }">
                <v-btn
                    v-bind="tooltipProps"
                    variant="outlined"
                    size="x-small"
                    text="exp"
                    @click="appendToExpression('exp(x)')"
                ></v-btn>
            </template>
        </v-tooltip>
        <v-tooltip location="bottom" text="add round function" open-delay="500">
            <template #activator="{ props: tooltipProps }">
                <v-btn
                    v-bind="tooltipProps"
                    variant="outlined"
                    size="x-small"
                    text="round"
                    @click="appendToExpression('round(x)')"
                ></v-btn>
            </template>
        </v-tooltip>
    </v-btn-group>
    <v-text-field v-model="expressionInputValue" label="Expression or Formula" single-line></v-text-field>
    <v-alert v-if="!!expressionError" type="error" :text="expressionError" />
</template>
