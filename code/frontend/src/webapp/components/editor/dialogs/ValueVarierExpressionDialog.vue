<script lang="ts" setup>
    import { ref } from "vue";
    import ExpressionInput from "../expression/ExpressionInput.vue";

    const model = defineModel<boolean>();

    const varMeanExpression = ref<string>("");
    const varCvExpression = ref<string>("");
    const nExpression = ref<string>("");
    const distributionExpression = ref<string>("normal");
    const absoluteTrendExpression = ref<string>("");
    const relativeTrendExpression = ref<string>("");
    const lowerLimitExpression = ref<string>("");
    const upperLimitExpression = ref<string>("");

    const getExpression = (): string => {
        const argList = [
            varMeanExpression.value,
            varCvExpression.value,
            nExpression.value,
            "",
            absoluteTrendExpression.value,
            relativeTrendExpression.value,
            lowerLimitExpression.value,
            upperLimitExpression.value
        ];

        const defaults = ["", "", "", '"normal"', "NA", "NA", "NA", "NA"];

        const lastNonEmptyIndex = argList.reduce((p, v, i) => (v != "" ? i : p), 0);
        const argsWithDefaults = argList.map((v, i) => (v != "" ? v : defaults[i]));
        const sliced = argsWithDefaults.slice(0, lastNonEmptyIndex + 1);
        return `vv(${sliced.join(", ")})`;
    };

    const emits = defineEmits<{
        submit: [string];
    }>();
</script>

<template>
    <v-dialog v-model="model" width="auto" height="auto" @click:outside="model = false">
        <v-card>
            <v-card-title>Value Varier Function</v-card-title>
            <v-card-text>
                <p>
                    Many variables vary over time and it may not be desirable to ignore this variation in time series
                    analyses. This function produces time series that contain variation from a specified mean and a
                    desired coefficient of variation. A trend can be added to this time series.
                </p>
                <h4>Parameters</h4>
                <ExpressionInput
                    v-model="varMeanExpression"
                    empty-label="var_mean"
                    filled-label="var_mean ="
                    :show-toolbar="false"
                    :focused-rows="1"
                    hint="Required: mean of the variable to be varied"
                />
                <ExpressionInput
                    v-model="varCvExpression"
                    empty-label="var_CV"
                    filled-label="var_CV ="
                    :show-toolbar="false"
                    :focused-rows="1"
                    hint="Required: desired coefficient of variation (in percent)"
                />
                <ExpressionInput
                    v-model="nExpression"
                    empty-label="n"
                    filled-label="n ="
                    :show-toolbar="false"
                    :focused-rows="1"
                    hint="Required: integer; number of values to produce"
                />
                <ExpressionInput
                    v-model="distributionExpression"
                    empty-label="distribution"
                    filled-label="distribution ="
                    :show-toolbar="false"
                    :focused-rows="1"
                    disabled
                    hint="Optional (default 'normal'): probability distribution for the introducing variation. Currently only implemented for 'normal'"
                />
                <ExpressionInput
                    v-model="absoluteTrendExpression"
                    empty-label="absolute_trend"
                    filled-label="absolute_trend ="
                    :show-toolbar="false"
                    :focused-rows="1"
                    hint="Optional (default 0): absolute increment in the var_mean in each time step. Defaults to NA, which means no such absolute value trend is present. If both absolute and relative trends are specified, only original means are used"
                />
                <ExpressionInput
                    v-model="relativeTrendExpression"
                    empty-label="relative_trend"
                    filled-label="relative_trend ="
                    :show-toolbar="false"
                    :focused-rows="1"
                    hint="Optional (default 0): relative trend in the var_mean in each time step (in percent). Defaults to NA, which means no such relative value trend is present. If both absolute and relative trends are specified, only original means are used"
                />
                <ExpressionInput
                    v-model="lowerLimitExpression"
                    empty-label="lower_limit"
                    filled-label="lower_limit ="
                    :show-toolbar="false"
                    :focused-rows="1"
                    hint="Optional (default NA): lowest possible value for elements of the resulting vector"
                />
                <ExpressionInput
                    v-model="lowerLimitExpression"
                    empty-label="upper_limit"
                    filled-label="upper_limit ="
                    :show-toolbar="false"
                    :focused-rows="1"
                    hint="Optional (default NA): upper possible value for elements of the resulting vector"
                />
                <h4>Note</h4>
                <p>
                    Note that only one type of trend can be specified. If neither of the trend parameters are NA, the
                    function uses only the original means
                </p>
                <h4>Return Value</h4>
                <p>
                    vector of n numeric values, representing a variable time series, which initially has the mean
                    var_mean, and then increases according to the specified trends. Variation is determined by the given
                    coefficient of variation var_CV
                </p>
                <h4>Further Information</h4>
                <p>
                    see
                    <a
                        href="https://cran.r-project.org/web/packages/decisionSupport/refman/decisionSupport.html#vv"
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
                    :disabled="varMeanExpression == '' || varCvExpression == '' || nExpression == ''"
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
