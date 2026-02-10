<script setup lang="ts">
    /**
     * Functions Tab of the Node Edit Dialog for Nodes with Operation or Result Function Type
     */
    import { USER_INPUT_DEBOUNCE_TIME } from "@/common/constants";
    import { getExpressionError, debounce } from "@decision-support-ui/common";
    import { computed, nextTick, ref, shallowRef, watch } from "vue";
    import ExpressionToolbarButton from "./ExpressionToolbarButton.vue";
    import ChanceEventExpressionDialog from "../dialogs/ChanceEventExpressionDialog.vue";
    import ValueVarierExpressionDialog from "../dialogs/ValueVarierExpressionDialog.vue";
    import DiscountExpressionDialog from "../dialogs/DiscountExpressionDialog.vue";
    import IfExpressionDialog from "../dialogs/IfExpressionDialog.vue";

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
            disabled?: boolean;
        }>(),
        {
            debounceTime: USER_INPUT_DEBOUNCE_TIME,
            showToolbar: true,
            hint: undefined,
            focusedRows: 3,
            disabled: false
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

    const isChanceEventDialogOpen = shallowRef<boolean>(false);
    const isValueVarierDialogOpen = shallowRef<boolean>(false);
    const isDiscountDialogOpen = shallowRef<boolean>(false);
    const isIfDialogOpen = shallowRef<boolean>(false);

    const refocusExpressionInput = async (isOpen: boolean) => {
        // update focus to textarea when dialog closes
        if (!isOpen) {
            await nextTick();
            expressionInputRef.value?.focus();
        }
    };

    watch(isChanceEventDialogOpen, refocusExpressionInput);
    watch(isValueVarierDialogOpen, refocusExpressionInput);
    watch(isDiscountDialogOpen, refocusExpressionInput);
    watch(isIfDialogOpen, refocusExpressionInput);

    const shouldShowToolbar = computed(
        () =>
            props.showToolbar &&
            !props.disabled &&
            (focused.value ||
                isChanceEventDialogOpen.value ||
                isValueVarierDialogOpen.value ||
                isDiscountDialogOpen.value ||
                isIfDialogOpen.value)
    );

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
            expression: "X + Y",
            tooltip: "addition"
        },
        {
            icon: "mdi-minus",
            size: "x-small",
            expression: "X - Y",
            tooltip: "subtraction"
        },
        {
            icon: "mdi-multiplication",
            size: "x-small",
            expression: "X * Y",
            tooltip: "multiplication"
        },
        {
            icon: "mdi-division",
            size: "x-small",
            expression: "X / Y",
            tooltip: "division"
        },
        {
            icon: "mdi-percent",
            size: "x-small",
            expression: "X % Y",
            tooltip: "modulo"
        }
    ];

    const COMARISON_OPERATORS: ExpressionToolbarButtonInfo[] = [
        {
            icon: "mdi-less-than",
            size: "x-small",
            expression: "X < Y",
            tooltip: "less than condition"
        },
        {
            icon: "mdi-less-than-or-equal",
            size: "x-small",
            expression: "X <= Y",
            tooltip: "less than or equal condition"
        },
        {
            icon: "mdi-equal",
            expression: "X == Y",
            tooltip: "equal condition"
        },
        {
            icon: "mdi-not-equal-variant",
            expression: "X != Y",
            tooltip: "not equal condition"
        },
        {
            icon: "mdi-greater-than",
            size: "x-small",
            expression: "X > Y",
            tooltip: "greater than condition"
        },
        {
            icon: "mdi-greater-than-or-equal",
            size: "x-small",
            expression: "X >= Y",
            tooltip: "greater than or equal condition"
        }
    ];

    const LOGIC_OPERATORS: ExpressionToolbarButtonInfo[] = [
        {
            label: "and",
            size: "small",
            expression: "X & Y",
            tooltip: "logical and of two conditions"
        },
        {
            label: "or",
            size: "small",
            expression: "X | Y",
            tooltip: "logical or of two conditions"
        },
        {
            label: "not",
            size: "small",
            expression: "!X",
            tooltip: "logical not"
        },
        {
            label: "true",
            size: "small",
            expression: "TRUE",
            tooltip: "logical true value"
        },
        {
            label: "false",
            size: "small",
            expression: "FALSE",
            tooltip: "logical false value"
        }
    ];

    const MATH_FUNCTIONS: ExpressionToolbarButtonInfo[] = [
        {
            icon: "mdi-exponent",
            expression: "X ^ Y",
            tooltip: "exponentiation"
        },
        {
            label: "sqrt",
            icon: "mdi-square-root",
            expression: "sqrt(X)",
            tooltip: "square root function"
        },
        {
            label: "abs",
            expression: "abs(X)",
            tooltip: "absolute value function"
        },
        {
            label: "sign",
            expression: "sign(X)",
            tooltip: "sign function (either 1 or -1 if value of positive or negative)"
        },
        {
            label: "log",
            expression: "log(X)",
            tooltip: "logarithm function"
        },
        {
            label: "exp",
            expression: "exp(X)",
            tooltip: "exponential function"
        },
        {
            label: "floor",
            expression: "floor(X)",
            tooltip: "round down to nearest integer"
        },
        {
            label: "ceil",
            expression: "ceil(X)",
            tooltip: "round up to nearest integer"
        },
        {
            label: "round",
            expression: "round(X)",
            tooltip: "round function"
        }
    ];

    const TRIGONOMETRY_FUNCTIONS: ExpressionToolbarButtonInfo[] = [
        {
            label: "sin",
            expression: "sin(X)",
            tooltip: "trigonometric sine function"
        },
        {
            label: "cos",
            expression: "cos(X)",
            tooltip: "trigonometric cosine function"
        },
        {
            label: "tan",
            expression: "tan(X)",
            tooltip: "trigonometric tan function"
        },
        {
            label: "tanh",
            expression: "tanh(X)",
            tooltip: "trigonometric tanh function"
        },
        {
            icon: "mdi-pi",
            expression: "mathematical constant pi",
            tooltip: "pi"
        }
    ];

    const SERIES_FUNCTIONS: ExpressionToolbarButtonInfo[] = [
        {
            label: "sum",
            expression: "sum(X)",
            tooltip: "sum of a series"
        },
        {
            label: "prod",
            expression: "prod(X)",
            tooltip: "product over a series"
        },
        {
            label: "min",
            expression: "min(X)",
            tooltip: "minimum of a series"
        },
        {
            label: "max",
            expression: "max(X)",
            tooltip: "maximum of a series"
        },
        {
            label: "mean",
            expression: "mean(X)",
            tooltip: "mean of a series"
        }
    ];

    const GROUP_OPERATORS: ExpressionToolbarButtonInfo[] = [
        {
            label: "( )",
            expression: "( )",
            tooltip: "parentheses for grouping operations"
        }
    ];
</script>

<template>
    <div class="expressionInputContainer" tabindex="-1" @focusin="focused = true" @focusout="onFocusOut">
        <div v-if="shouldShowToolbar">
            <v-btn-group class="functionGroup">
                <template
                    v-for="(list, listIdx) in [MATH_OPERATIONS, GROUP_OPERATORS, COMARISON_OPERATORS]"
                    :key="listIdx"
                >
                    <ExpressionToolbarButton
                        v-for="(item, itemIdx) in list"
                        :key="itemIdx"
                        :icon="item.icon"
                        :label="item.label"
                        :tooltip="item.tooltip"
                        :syntax="item.expression"
                        :size="item.size"
                        :click="() => (item.expression ? appendToExpression(item.expression) : null)"
                    />
                    <v-divider vertical />
                </template>
                <ExpressionToolbarButton
                    label="if"
                    tooltip="if condition"
                    syntax="if ( CONDITION ) VALUE_IF else VALUE_IF_NOT"
                    size="small"
                    :click="() => (isIfDialogOpen = true)"
                />
                <IfExpressionDialog v-model="isIfDialogOpen" @submit="(e: string) => appendToExpression(e)" />
                <template v-for="(list, listIdx) in [LOGIC_OPERATORS]" :key="listIdx">
                    <ExpressionToolbarButton
                        v-for="(item, itemIdx) in list"
                        :key="itemIdx"
                        :icon="item.icon"
                        :label="item.label"
                        :tooltip="item.tooltip"
                        :syntax="item.expression"
                        :size="item.size"
                        :click="() => (item.expression ? appendToExpression(item.expression) : null)"
                    />
                    <v-divider vertical />
                </template>
            </v-btn-group>
            <v-btn-group class="functionGroup">
                <template v-for="(list, listIdx) in [MATH_FUNCTIONS, TRIGONOMETRY_FUNCTIONS]" :key="listIdx">
                    <ExpressionToolbarButton
                        v-for="(item, itemIdx) in list"
                        :key="itemIdx"
                        :icon="item.icon"
                        :label="item.label"
                        :tooltip="item.tooltip"
                        :syntax="item.expression"
                        :size="item.size"
                        :click="() => (item.expression ? appendToExpression(item.expression) : null)"
                    />
                    <v-divider vertical />
                </template>
            </v-btn-group>
            <v-btn-group class="functionGroup">
                <ExpressionToolbarButton
                    label="chance_event"
                    tooltip="decisionSupport 'chance_event' function"
                    syntax="chance_event(CHANCE, VALUE_IF, VALUE_IF_NOT, N, CV_IF, CV_IF_NOT, ONE_DRAW)"
                    size="small"
                    :click="() => (isChanceEventDialogOpen = true)"
                />
                <ChanceEventExpressionDialog
                    v-model="isChanceEventDialogOpen"
                    @submit="(e: string) => appendToExpression(e)"
                />
                <ExpressionToolbarButton
                    label="vv"
                    tooltip="decisionSupport 'vv' function (value varier)"
                    syntax="vv(VAR_MEAN, VAR_CV, N, DISTRIBUTION, ABSOLUTE_TREND, RELATIVE_TREND, LOWER_LIMIT, UPPER_LIMIT)"
                    size="small"
                    :click="() => (isValueVarierDialogOpen = true)"
                />
                <ValueVarierExpressionDialog
                    v-model="isValueVarierDialogOpen"
                    @submit="(e: string) => appendToExpression(e)"
                />
                <ExpressionToolbarButton
                    label="discount"
                    tooltip="decisionSupport 'discount' function (net present value)"
                    syntax="discount(X, DISCOUNT_RATE, CALCULATE_NPV)"
                    size="small"
                    :click="() => (isDiscountDialogOpen = true)"
                />
                <DiscountExpressionDialog
                    v-model="isDiscountDialogOpen"
                    @submit="(e: string) => appendToExpression(e)"
                />
                <v-divider vertical />
                <template v-for="(list, listIdx) in [SERIES_FUNCTIONS]" :key="listIdx">
                    <ExpressionToolbarButton
                        v-for="(item, itemIdx) in list"
                        :key="itemIdx"
                        :icon="item.icon"
                        :label="item.label"
                        :tooltip="item.tooltip"
                        :syntax="item.expression"
                        :size="item.size"
                        :click="() => (item.expression ? appendToExpression(item.expression) : null)"
                    />
                    <v-divider vertical />
                </template>
                <ExpressionToolbarButton
                    label="NA"
                    tooltip="unavailable function argument"
                    syntax="NA"
                    size="small"
                    :click="() => appendToExpression('NA')"
                />
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
            :disabled="props.disabled"
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
