<script setup lang="ts">
    /**
     * Functions Tab of the Node Edit Dialog for Nodes with Operation or Result Function Type
     */
    import { USER_INPUT_DEBOUNCE_TIME } from "@/common/constants";
    import { debounce } from "@/common/throttle";
    import { getExpressionError } from "@decision-support-ui/common";
    import { computed, nextTick, ref, shallowRef, watch } from "vue";
    import FlowExpressionInputButton from "./FlowExpressionInputToolbarButton.vue";
    import FlowExpressionInputChanceEventDialog from "./FlowExpressionInputChanceEventDialog.vue";

    const expression = defineModel<string>({
        required: true
    });
    const props = withDefaults(
        defineProps<{
            emptyLabel: string;
            filledLabel: string;
            debounceTime?: number;
            showToolbar?: boolean;
            hint?: string;
            focusedRows?: number;
        }>(),
        {
            debounceTime: USER_INPUT_DEBOUNCE_TIME,
            showToolbar: true,
            hint: undefined,
            focusedRows: 3
        }
    );

    const expressionInputRef = ref<HTMLElement | null>();
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

    const chanceEventDialog = shallowRef<boolean>(false);

    watch(chanceEventDialog, async isOpen => {
        // update focus to textarea when dialog closes
        if (!isOpen) {
            await nextTick();
            expressionInputRef.value?.focus();
        }
    });

    export type ExpressionToolbarButtonInfo = {
        label?: string;
        icon?: string;
        size?: string;
        expression?: string;
        tooltip?: string;
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
            tooltip: "subtraction"
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
            tooltip: "logical not"
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
            tooltip: "square root function"
        },
        {
            label: "abs",
            expression: "abs(x)",
            tooltip: "absolute value function"
        },
        {
            label: "sign",
            expression: "sign(x)",
            tooltip: "sign function"
        },
        {
            label: "log",
            expression: "log(x)",
            tooltip: "logarithm function"
        },
        {
            label: "exp",
            expression: "exp(x)",
            tooltip: "exponential function"
        },
        {
            label: "floor",
            expression: "floor(x)",
            tooltip: "floor function"
        },
        {
            label: "ceil",
            expression: "ceil(x)",
            tooltip: "ceil function"
        },
        {
            label: "round",
            expression: "round(x)",
            tooltip: "round function"
        }
    ];

    const TRIGONOMETRY_FUNCTIONS: ExpressionToolbarButtonInfo[] = [
        {
            label: "sin",
            expression: "sin(x)",
            tooltip: "sine function"
        },
        {
            label: "cos",
            expression: "cos(x)",
            tooltip: "cosine function"
        },
        {
            label: "tan",
            expression: "tan(x)",
            tooltip: "tan function"
        },
        {
            label: "tanh",
            expression: "tanh(x)",
            tooltip: "tanh function"
        },
        {
            icon: "mdi-pi",
            expression: "pi",
            tooltip: "pi"
        }
    ];

    const SERIES_FUNCTIONS: ExpressionToolbarButtonInfo[] = [
        {
            label: "sum",
            expression: "sum(x)",
            tooltip: "sum of a series"
        },
        {
            label: "prod",
            expression: "prod(x)",
            tooltip: "product over a series"
        },
        {
            label: "min",
            expression: "min(x)",
            tooltip: "minimum of a series"
        },
        {
            label: "max",
            expression: "max(x)",
            tooltip: "maximum of a series"
        },
        {
            label: "mean",
            expression: "mean(x)",
            tooltip: "mean of a series"
        }
    ];

    const GROUP_OPERATORS: ExpressionToolbarButtonInfo[] = [
        {
            label: "( )",
            expression: "( )",
            tooltip: "parentheses"
        }
    ];
</script>

<template>
    <div class="expressionInputContainer" tabindex="-1" @focusin="focused = true" @focusout="onFocusOut">
        <div v-if="showToolbar && (focused || chanceEventDialog)">
            <v-btn-group class="functionGroup">
                <template
                    v-for="(list, listIdx) in [MATH_OPERATIONS, GROUP_OPERATORS, COMARISON_OPERATORS, MATH_FUNCTIONS]"
                    :key="listIdx"
                >
                    <FlowExpressionInputButton
                        v-for="(item, itemIdx) in list"
                        :key="itemIdx"
                        :icon="item.icon"
                        :label="item.label"
                        :tooltip="item.tooltip"
                        :size="item.size"
                        :click="() => (item.expression ? appendToExpression(item.expression) : null)"
                    />
                    <v-divider vertical />
                </template>
            </v-btn-group>
            <v-btn-group class="functionGroup">
                <FlowExpressionInputButton
                    label="chance_event"
                    tooltip="chance event function"
                    size="small"
                    :click="
                        () => {
                            chanceEventDialog = true;
                            console.log('open chance event dialog');
                        }
                    "
                />
                <FlowExpressionInputChanceEventDialog
                    v-model="chanceEventDialog"
                    :submit="(e: string) => appendToExpression(e)"
                />
                <FlowExpressionInputButton
                    label="vv"
                    tooltip="value varier function"
                    size="small"
                    :click="() => console.log('open vv dialog')"
                />
                <FlowExpressionInputButton
                    label="discount"
                    tooltip="net present value function"
                    size="small"
                    :click="() => console.log('open discount dialog')"
                />
                <v-divider vertical />
                <template
                    v-for="(list, listIdx) in [LOGIC_OPERATORS, SERIES_FUNCTIONS, TRIGONOMETRY_FUNCTIONS]"
                    :key="listIdx"
                >
                    <FlowExpressionInputButton
                        v-for="(item, itemIdx) in list"
                        :key="itemIdx"
                        :icon="item.icon"
                        :label="item.label"
                        :tooltip="item.tooltip"
                        :size="item.size"
                        :click="() => (item.expression ? appendToExpression(item.expression) : null)"
                    />
                    <v-divider vertical />
                </template>
            </v-btn-group>
        </div>

        <v-textarea
            ref="expressionInputRef"
            v-model="expressionInputValue"
            :label="expressionInputValue ? filledLabel : emptyLabel"
            auto-grow
            max-rows="5"
            :rows="focused ? props.focusedRows : 1"
            class="expressionInput"
            :persistent-hint="!!props.hint"
            :hint="props.hint"
            :hide-details="!expressionError && !props.hint"
            :error="!!expressionError"
            :error-messages="expressionError"
        ></v-textarea>
    </div>
</template>

<style scoped lang="scss">
    .expressionInputContainer {
        display: flex;
        flex-direction: column;
        gap: 1px;
    }

    .functionGroup {
        flex-grow: 1;
        display: flex;
        height: auto;

        &:not(:last-child) {
            :deep(button) {
                border-bottom: 0;
            }
        }
    }

    :deep(.v-alert) {
        margin-top: 1em;
    }
</style>
