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

    const chanceExpression = ref<string>("");
    const valueIfExpression = ref<string>("");
    const valueIfNotExpression = ref<string>("");
    const nExpression = ref<string>("");
    const cvIfExpression = ref<string>("");
    const cvIfNotExpression = ref<string>("");
    const oneDrawExpression = ref<string>("");

    const getExpression = (): string => {
        const argList = [
            chanceExpression.value,
            valueIfExpression.value,
            valueIfNotExpression.value,
            nExpression.value,
            cvIfExpression.value,
            cvIfNotExpression.value,
            oneDrawExpression.value
        ];

        const defaults = ["", "1", "0", "1", "0", "NA", "0"];

        const lastNonEmptyIndex = argList.reduce((p, v, i) => (v != "" ? i : p), 0);
        const argsWithDefaults = argList.map((v, i) => (v != "" ? v : defaults[i]));
        const sliced = argsWithDefaults.slice(0, lastNonEmptyIndex + 1);
        return `chance_event(${sliced.join(", ")})`;
    };

    const emits = defineEmits<{
        submit: [string];
    }>();
</script>

<template>
    <v-dialog v-model="model" width="auto" height="auto" @click:outside="model = false">
        <v-card>
            <v-card-title>Chance Event Function</v-card-title>
            <v-card-text>
                <p>
                    In many simulations, certain events can either occur or not, and values for dependent variables can
                    depend on which of the cases occurs. This function randomly simulates whether events occur and
                    returns output values accordingly. The outputs can be single values or series of values, with the
                    option of introducing artificial variation into this dataset.
                </p>
                <h4>Parameters</h4>
                <ExpressionInput
                    v-model="chanceExpression"
                    empty-label="chance"
                    filled-label="chance ="
                    :show-toolbar="false"
                    :focused-rows="1"
                    hint="Required: probability that the risky event will occur (between 0 and 1)"
                    :known-variables="props.knownVariables"
                />
                <ExpressionInput
                    v-model="valueIfExpression"
                    empty-label="value_if"
                    filled-label="value_if ="
                    :show-toolbar="false"
                    :focused-rows="1"
                    hint="Optional (default 1): output value in case the event occurs. This can be either a single numeric value or a numeric vector."
                    :known-variables="props.knownVariables"
                />
                <ExpressionInput
                    v-model="valueIfNotExpression"
                    empty-label="value_if_not"
                    filled-label="value_if_not ="
                    :show-toolbar="false"
                    :focused-rows="1"
                    hint="Optional (default 0): output value in case the event does not occur. This can be either a single
                        numeric value or a numeric vector. If it is a vector, it must have the same length as value_if"
                    :known-variables="props.knownVariables"
                />
                <ExpressionInput
                    v-model="nExpression"
                    empty-label="n"
                    filled-label="n ="
                    :show-toolbar="false"
                    :focused-rows="1"
                    hint="Optional (default 1): number of times the risky event is simulated. This is ignored if length(value_if)>1."
                    :known-variables="props.knownVariables"
                />
                <ExpressionInput
                    v-model="cvIfExpression"
                    empty-label="CV_if"
                    filled-label="CV_if ="
                    :show-toolbar="false"
                    :focused-rows="1"
                    hint="Optional (default 0): coefficient of variation for introducing randomness into the value_if data set. This
                        defaults to 0 for no artificial variation. See documentation for the vv function for details."
                    :known-variables="props.knownVariables"
                />
                <ExpressionInput
                    v-model="cvIfNotExpression"
                    empty-label="CV_if_not"
                    filled-label="CV_if_not ="
                    :show-toolbar="false"
                    :focused-rows="1"
                    hint="Optional (default CV_if): coefficient of variation for introducing randomness into the value_if_not data set.
                        This defaults to the value for CV_if. See documentation for the vv function for details."
                    :known-variables="props.knownVariables"
                />
                <ExpressionInput
                    v-model="oneDrawExpression"
                    empty-label="one_draw"
                    filled-label="one_draw ="
                    :show-toolbar="false"
                    :focused-rows="1"
                    hint="Optional (default false): boolean coefficient indicating if event occurrence is determined only once (TRUE)
                        with results applying to all elements of the results vector, or if event occurrence is
                        determined independently for each element (FALSE; the default)"
                    :known-variables="props.knownVariables"
                />
                <h4>Return Value</h4>
                <p>
                    Returns a numeric vector of the same length as <code>value_if</code> or, if
                    <code>length(value_if)==1</code> of length <code>n</code>, containing outputs of a probabilistic
                    simulation that assigns <code>value_if</code> if the event occurs, or <code>value_if_not</code> if
                    is does not occur (both optionally with artificial variation)
                </p>
                <h4>Further Information</h4>
                <p>
                    see
                    <a
                        href="https://cran.r-project.org/web/packages/decisionSupport/refman/decisionSupport.html#chance_event"
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
                    :disabled="chanceExpression == ''"
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
