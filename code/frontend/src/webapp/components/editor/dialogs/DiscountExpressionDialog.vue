<script lang="ts" setup>
    import { ref } from "vue";
    import ExpressionInput from "../expression/ExpressionInput.vue";

    const model = defineModel<boolean>();

    const props = withDefaults(
        defineProps<{
            knownVariables?: string[];
        }>(),
        {
            knownVariables: () => []
        }
    );

    const xExpression = ref<string>("");
    const discountRateExpression = ref<string>("");
    const calculateNpvExpression = ref<string>("");

    const getExpression = (): string => {
        const argList = [xExpression.value, discountRateExpression.value, calculateNpvExpression.value];

        const defaults = ["", "", "FALSE"];

        const lastNonEmptyIndex = argList.reduce((p, v, i) => (v != "" ? i : p), 0);
        const argsWithDefaults = argList.map((v, i) => (v != "" ? v : defaults[i]));
        const sliced = argsWithDefaults.slice(0, lastNonEmptyIndex + 1);
        return `discount(${sliced.join(", ")})`;
    };

    const emits = defineEmits<{
        submit: [string];
    }>();
</script>

<template>
    <v-dialog v-model="model" width="auto" height="auto" @click:outside="model = false">
        <v-card>
            <v-card-title>Discount Function</v-card-title>
            <v-card-text>
                <p>
                    This function discounts values along a time series, applying the specified discount rate. It can
                    also calculate the Net Present Value (NPV), which is the sum of these discounted values.
                </p>
                <h4>Parameters</h4>
                <ExpressionInput
                    v-model="xExpression"
                    empty-label="x"
                    filled-label="x ="
                    :show-toolbar="false"
                    :focused-rows="1"
                    hint="Required: numeric vector, typically containing time series data of costs or benefits"
                    :known-variables="props.knownVariables"
                />
                <ExpressionInput
                    v-model="discountRateExpression"
                    empty-label="discount_rate"
                    filled-label="discount_rate ="
                    :show-toolbar="false"
                    :focused-rows="1"
                    hint="Required: numeric; the discount rate (in percent), expressing the time preference of whoever is evaluating these data economically"
                    :known-variables="props.knownVariables"
                />
                <ExpressionInput
                    v-model="calculateNpvExpression"
                    empty-label="calculate_NPV"
                    filled-label="calculate_NPV ="
                    :show-toolbar="false"
                    :focused-rows="1"
                    hint="Optional: boolean (default FALSE); if set to TRUE, the discounted time values are summed, otherwise, they are returned as a vector"
                    :known-variables="props.knownVariables"
                />
                <h4>Return Value</h4>
                <p>
                    If <code>calculate_NPV=TRUE</code>, the function returns the Net Present Value (NPV) as a numeric
                    value. If <code>calculate_NPV=FALSE</code>, the time-discounted values are returned as a numeric
                    vector.
                </p>
                <h4>Further Information</h4>
                <p>
                    see
                    <a
                        href="https://cran.r-project.org/web/packages/decisionSupport/refman/decisionSupport.html#discount"
                        target="_blank"
                        rel="nofollow"
                    >
                        CRAN decisionSupport documentation
                    </a>
                </p>
            </v-card-text>
            <v-card-actions>
                <v-btn color="grey" variant="text" @click="model = false">cancel</v-btn>
                <v-btn
                    color="primary"
                    variant="text"
                    :disabled="xExpression == '' || discountRateExpression == ''"
                    @click="
                        emits('submit', getExpression());
                        model = false;
                    "
                >
                    insert
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<style lang="scss" scoped>
    .v-dialog {
        .v-card {
            padding: 0.5em;
        }

        .v-card-title {
            padding: 1em 1em 0.5em 1em;
            font-weight: 400;
        }

        .v-card-text {
            overflow: auto;
            display: flex;
            flex-direction: column;
            gap: 1em;
        }

        .v-card-actions {
            padding: 1em;
        }

        :deep(.v-input),
        :deep(p) {
            max-width: 50em;
        }
    }
</style>
