<script setup lang="ts">
    /**
     * Functions Tab of the Node Edit Dialog for Nodes with Operation or Result Function Type
     */
    import { USER_INPUT_DEBOUNCE_TIME } from "@/common/constants";
    import { debounce } from "@/common/throttle";
    import { getExpressionError } from "@decision-support-ui/common";
    import { computed, ref, watch } from "vue";

    const expression = defineModel<string>({
        required: true
    });
    const props = withDefaults(defineProps<{ debounceTime?: number; label?: string }>(), {
        debounceTime: USER_INPUT_DEBOUNCE_TIME,
        label: "Expression or Formula"
    });

    const expressionInputValue = ref<string>(expression.value);

    watch(expression, value => {
        expressionInputValue.value = value;
    });

    watch(
        expressionInputValue,
        debounce((value: string) => {
            if (expression.value != value) {
                expression.value = value;
            }
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

    const MATH_FUNCTIONS: { label: string; expression: string; tooltip: string }[] = [
        {
            label: "abs",
            expression: "abs(x)",
            tooltip: "add absolute value function"
        },
        {
            label: "log",
            expression: "log(x)",
            tooltip: "add logarithm function"
        },
        {
            label: "exp",
            expression: "exp(x)",
            tooltip: "add exponential function"
        },
        {
            label: "sqrt",
            expression: "sqrt(x)",
            tooltip: "add square root function"
        },
        {
            label: "floor",
            expression: "floor(x)",
            tooltip: "add floor function"
        },
        {
            label: "ceil",
            expression: "ceil(x)",
            tooltip: "add ceil function"
        },
        {
            label: "round",
            expression: "round(x)",
            tooltip: "add round function"
        }
    ];
</script>

<template>
    <v-btn-group>
        <v-tooltip location="bottom" text="add if condition" open-delay="500">
            <template #activator="{ props: tooltipProps }">
                <v-btn
                    v-bind="tooltipProps"
                    variant="outlined"
                    size="x-small"
                    text="if"
                    @click="appendToExpression('if ( CONDITION ) TRUE_VALUE else FALSE_VALUE')"
                ></v-btn>
            </template>
        </v-tooltip>
        <v-divider vertical></v-divider>
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

        <v-tooltip
            v-for="item in MATH_FUNCTIONS"
            :key="item.label"
            location="bottom"
            :text="item.tooltip"
            open-delay="500"
        >
            <template #activator="{ props: tooltipProps }">
                <v-btn
                    v-bind="tooltipProps"
                    variant="outlined"
                    size="x-small"
                    :text="item.label"
                    @click="appendToExpression(item.expression)"
                ></v-btn>
            </template>
        </v-tooltip>
    </v-btn-group>
    <v-textarea
        v-model="expressionInputValue"
        :label="props.label"
        auto-grow
        max-rows="5"
        rows="1"
        persistent-hint
    ></v-textarea>
    <v-alert v-if="!!expressionError" type="error" :text="expressionError" />
</template>

<style scoped lang="scss">
    .v-text-field {
        min-width: 25em;
    }
</style>
