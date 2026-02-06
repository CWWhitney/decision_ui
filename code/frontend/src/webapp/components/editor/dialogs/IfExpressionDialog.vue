<script lang="ts" setup>
    import { ref } from "vue";
    import ExpressionInput from "../expression/ExpressionInput.vue";

    const model = defineModel<boolean>();

    const conditionExpression = ref<string>("");
    const valueIfExpression = ref<string>("");
    const valueIfNotExpression = ref<string>("");

    const getExpression = (): string => {
        return `if (${conditionExpression.value}) ${valueIfExpression.value} else ${valueIfNotExpression.value}`;
    };

    const emits = defineEmits<{
        submit: [string];
    }>();
</script>

<template>
    <v-dialog v-model="model" width="auto" height="auto" @click:outside="model = false">
        <v-card>
            <v-card-title>If Condition</v-card-title>
            <v-card-text>
                <h4>Syntax</h4>
                <p><code>if ( CONDITION ) VALUE_IF else VALUE_IF_NOT</code></p>
                <h4>Parameters</h4>
                <ExpressionInput
                    v-model="conditionExpression"
                    empty-label="condition"
                    filled-label="condition ="
                    :show-toolbar="false"
                    :focused-rows="1"
                    hint="Required: if this condition evaluates to TRUE, 'value_if' is used, otherwise 'value_if_not' is used"
                />
                <ExpressionInput
                    v-model="valueIfExpression"
                    empty-label="value_if"
                    filled-label="value_if ="
                    :show-toolbar="false"
                    :focused-rows="1"
                    hint="Required: output value in case the condition evaluates to TRUE."
                />
                <ExpressionInput
                    v-model="valueIfNotExpression"
                    empty-label="value_if_not"
                    filled-label="value_if_not ="
                    :show-toolbar="false"
                    :focused-rows="1"
                    hint="Required: output value in case the condition evaluates to FALSE."
                />
                <h4>Example</h4>
                <p>
                    <code>if (ThresholdVariable > 10) SevereCostVariable else RegularCostVariable</code>
                </p>
            </v-card-text>
            <v-card-actions>
                <v-btn color="grey" variant="text" @click="model = false">cancel</v-btn>
                <v-btn
                    color="primary"
                    variant="text"
                    :disabled="conditionExpression == '' || valueIfExpression == '' || valueIfNotExpression == ''"
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
