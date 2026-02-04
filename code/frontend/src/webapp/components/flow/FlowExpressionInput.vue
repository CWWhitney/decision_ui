<script setup lang="ts">
    /**
     * Functions Tab of the Node Edit Dialog for Nodes with Operation or Result Function Type
     */
    import { USER_INPUT_DEBOUNCE_TIME } from "@/common/constants";
    import { debounce } from "@/common/throttle";
    import { getExpressionError } from "@decision-support-ui/common";
    import { computed, ref, watch } from "vue";
    import type { ExpressionToolbarButtonInfo } from "./FlowExpressionInputButtonList.vue";
    import FlowExpressionInputButtonList from "./FlowExpressionInputButtonList.vue";

    const expression = defineModel<string>({
        required: true
    });
    const props = withDefaults(defineProps<{ emptyLabel: string; filledLabel: string; debounceTime?: number }>(), {
        debounceTime: USER_INPUT_DEBOUNCE_TIME
    });

    const expressionInputValue = ref<string>(expression.value);
    const focused = ref<boolean>(false);

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
        if (expression.value != "") {
            return getExpressionError(expression.value);
        }
        return null;
    });

    const appendToExpression = (text: string) => {
        expressionInputValue.value = `${expressionInputValue.value}${text}`;
    };

    const onFocusOut = (e: FocusEvent) => {
        const currentTarget = e.currentTarget as HTMLElement | null;
        const relatedTarget = e.relatedTarget as HTMLElement | null;

        if (!currentTarget || !relatedTarget || !currentTarget.contains(relatedTarget)) {
            setTimeout(() => {
                focused.value = false;
            }, 100);
        }
    };

    const MATH_OPERATIONS: ExpressionToolbarButtonInfo[] = [
        {
            icon: "mdi-plus",
            expression: "x + y",
            tooltip: "addition"
        },
        {
            icon: "mdi-minus",
            size: "x-small",
            expression: "x - y",
            tooltip: "substract"
        },
        {
            icon: "mdi-multiplication",
            size: "x-small",
            expression: "x * y",
            tooltip: "multiplication"
        },
        {
            icon: "mdi-division",
            size: "x-small",
            expression: "x / y",
            tooltip: "division"
        },
        {
            icon: "mdi-percent",
            size: "x-small",
            expression: "x % y",
            tooltip: "modulo"
        }
    ];

    const COMARISON_OPERATORS: ExpressionToolbarButtonInfo[] = [
        {
            icon: "mdi-less-than",
            size: "x-small",
            expression: "x < y",
            tooltip: "less than condition"
        },
        {
            icon: "mdi-less-than-or-equal",
            size: "x-small",
            expression: "x <= y",
            tooltip: "less than or equal condition"
        },
        {
            icon: "mdi-equal",
            expression: "x == y",
            tooltip: "equal condition"
        },
        {
            icon: "mdi-not-equal-variant",
            expression: "x != y",
            tooltip: "not equal condition"
        },
        {
            icon: "mdi-greater-than",
            size: "x-small",
            expression: "x > y",
            tooltip: "greater than condition"
        },
        {
            icon: "mdi-greater-than-or-equal",
            size: "x-small",
            expression: "x >= y",
            tooltip: "greater than or equal condition"
        }
    ];

    const LOGIC_OPERATORS: ExpressionToolbarButtonInfo[] = [
        {
            label: "if",
            size: "small",
            expression: "if ( CONDITION ) TRUE_VALUE else FALSE_VALUE",
            tooltip: "if condition"
        },
        {
            label: "and",
            size: "small",
            expression: "x & y",
            tooltip: "logical and of two conditions"
        },
        {
            label: "or",
            size: "small",
            expression: "x | y",
            tooltip: "logical or of two conditions"
        },
        {
            label: "not",
            size: "small",
            expression: "!",
            tooltip: "reverses a condition, logical not "
        }
    ];

    const MATH_FUNCTIONS: ExpressionToolbarButtonInfo[] = [
        {
            icon: "mdi-exponent",
            expression: "x ^ y",
            tooltip: "power of "
        },
        {
            label: "sqrt",
            icon: "mdi-square-root",
            expression: "sqrt(x)",
            tooltip: "add square root function"
        },
        {
            label: "abs",
            expression: "abs(x)",
            tooltip: "add absolute value function"
        },
        {
            label: "sign",
            expression: "sign(x)",
            tooltip: "add sign function"
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

    const TRIGONOMETRY_FUNCTIONS: ExpressionToolbarButtonInfo[] = [
        {
            label: "sin",
            expression: "sin(x)",
            tooltip: "add sine function"
        },
        {
            label: "cos",
            expression: "cos(x)",
            tooltip: "add cosine function"
        },
        {
            label: "tan",
            expression: "tan(x)",
            tooltip: "add tan function"
        },
        {
            label: "tanh",
            expression: "tanh(x)",
            tooltip: "add tanh function"
        },
        {
            icon: "mdi-pi",
            expression: "pi",
            tooltip: "add pi"
        }
    ];

    const SERIES_FUNCTIONS: ExpressionToolbarButtonInfo[] = [
        {
            label: "sum",
            expression: "sum(x)",
            tooltip: "add series sum function"
        },
        {
            label: "prod",
            expression: "prod(x)",
            tooltip: "add series product function"
        },
        {
            label: "min",
            expression: "min(x)",
            tooltip: "add series min function"
        },
        {
            label: "max",
            expression: "max(x)",
            tooltip: "add series max function"
        },
        {
            label: "mean",
            expression: "mean(x)",
            tooltip: "add series mean function"
        }
    ];

    const GROUP_OPERATORS: ExpressionToolbarButtonInfo[] = [
        {
            label: "( )",
            expression: "( )",
            tooltip: "add parentheses"
        }
    ];

    const DECISION_SUPPORT_FUNCTIONS: ExpressionToolbarButtonInfo[] = [
        {
            label: "chance_event",
            expression: "chance_event(chance, value_if, value_if_not, n, cv_if, cv_if_not, one_draw)",
            tooltip: "add chance event function"
        },
        {
            label: "vv",
            expression: "vv(mean, cv, n, absolute_trend, relative_trend, lower_limit, upper_limit)",
            tooltip: "add value varier function"
        },
        {
            label: "discount",
            expression: "discount(x, discount)",
            tooltip: "add net present value function"
        }
    ];
</script>

<template>
    <div class="container" tabindex="-1" @focusin="focused = true" @focusout="onFocusOut">
        <div v-if="focused">
            <v-btn-group class="functionGroup">
                <FlowExpressionInputButtonList :list="MATH_OPERATIONS" :append-to-expression="appendToExpression" />
                <v-divider vertical />
                <FlowExpressionInputButtonList :list="GROUP_OPERATORS" :append-to-expression="appendToExpression" />
                <v-divider vertical />
                <FlowExpressionInputButtonList :list="COMARISON_OPERATORS" :append-to-expression="appendToExpression" />
                <v-divider vertical />
                <FlowExpressionInputButtonList :list="LOGIC_OPERATORS" :append-to-expression="appendToExpression" />
                <v-divider vertical />
                <FlowExpressionInputButtonList :list="MATH_FUNCTIONS" :append-to-expression="appendToExpression" />
            </v-btn-group>
            <v-btn-group class="functionGroup">
                <FlowExpressionInputButtonList
                    :list="DECISION_SUPPORT_FUNCTIONS"
                    :append-to-expression="appendToExpression"
                />
                <v-divider vertical />
                <FlowExpressionInputButtonList :list="SERIES_FUNCTIONS" :append-to-expression="appendToExpression" />
                <v-divider vertical />
                <FlowExpressionInputButtonList
                    :list="TRIGONOMETRY_FUNCTIONS"
                    :append-to-expression="appendToExpression"
                />
            </v-btn-group>
        </div>

        <v-textarea
            v-model="expressionInputValue"
            :label="expressionInputValue ? filledLabel : emptyLabel"
            auto-grow
            max-rows="5"
            :rows="focused ? 3 : 1"
            class="expressionInput"
            :hide-details="!expressionError"
            :error="!!expressionError"
            :error-messages="expressionError"
        ></v-textarea>
    </div>
</template>

<style scoped lang="scss">
    .functionGroup {
        flex-grow: 1;
        display: flex;
        height: auto;

        &:not(:last-child) {
            :deep(button) {
                border-bottom: 0;
            }
        }

        :deep(button) {
            flex-grow: 1;
            min-height: 4em;
        }
    }

    .expressionInput {
        margin: 1px 0;
    }

    :deep(.v-alert) {
        margin-top: 1em;
    }
</style>
