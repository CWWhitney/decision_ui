<script setup lang="ts">
    /**
     * Functions Tab of the Node Edit Dialog for Nodes with Loop Function Type
     */
    import { USER_INPUT_DEBOUNCE_TIME } from "@/common/constants";
    import {
        type AbstractNode,
        type EstimateNodeFunctionState,
        type VariableNodeType,
        DETERMINISTIC_DISTRIBUTION_TYPE,
        NORMAL_DISTRIBUTION_TYPE,
        POSNORM_DISTRIBUTION_TYPE,
        TNORM01_DISTRIBUTION_TYPE,
        debounce
    } from "@decision-support-ui/common";
    import { computed, ref, watch } from "vue";
    import HelpHintWrapper from "../../form/HelpHintWrapper.vue";

    const node = defineModel<AbstractNode<VariableNodeType, EstimateNodeFunctionState, any>>({ required: true });
    const props = defineProps({
        debounceTime: {
            type: Number,
            default: USER_INPUT_DEBOUNCE_TIME,
            required: false
        }
    });

    const lowerInputValue = ref<number>(node.value.function.lower);
    const upperInputValue = ref<number>(node.value.function.upper);

    const lower = computed(() => node.value.function.lower);
    const upper = computed(() => node.value.function.upper);

    watch(lower, value => {
        lowerInputValue.value = value;
    });

    watch(upper, value => {
        upperInputValue.value = value;
    });

    watch(
        lowerInputValue,
        debounce((value: number) => {
            if (node.value.function.lower != value) {
                node.value.function.lower = value;
                if (node.value.function.distribution == DETERMINISTIC_DISTRIBUTION_TYPE) {
                    node.value.function.upper = value;
                }
            }
        }, props.debounceTime)
    );

    watch(
        upperInputValue,
        debounce((value: number) => {
            if (node.value.function.upper != value) {
                node.value.function.upper = value;
            }
        }, props.debounceTime)
    );

    const DISTRIBUTION_VALUES = [
        { title: "Deterministic (const)", value: DETERMINISTIC_DISTRIBUTION_TYPE },
        { title: "Normal Distribution (norm)", value: NORMAL_DISTRIBUTION_TYPE },
        { title: "Positive Truncated Normal Distribution (posnorm)", value: POSNORM_DISTRIBUTION_TYPE },
        { title: "0-1 Truncated Normal Distribution (tnorm_0_1)", value: TNORM01_DISTRIBUTION_TYPE }
    ];
</script>

<template>
    <div class="estimateFunctionTabContainer">
        <div>The value of this node is sampled from the following probabilistic distribution:</div>
        <HelpHintWrapper>
            <template #default>
                <v-select
                    v-model="node.function.distribution"
                    label="Distribution"
                    :items="DISTRIBUTION_VALUES"
                    hide-details
                ></v-select>
            </template>
            <template #tooltip>
                Choose one of the available distribution types that this is estimate is sampled from:
                <ul>
                    <li>
                        deterministic - a single constant, also called a one-point distribution, or
                        <a href="https://en.wikipedia.org/wiki/Dirac_delta_function" target="_blank" rel="nofollow"
                            >Dirac function</a
                        >
                    </li>
                    <li>
                        normal - a
                        <a href="https://en.wikipedia.org/wiki/Normal_distribution" target="_blank" rel="nofollow"
                            >normal distribution</a
                        >, also called Gaussian distribution
                    </li>
                    <li>
                        positive normal - a one-sided
                        <a
                            href="https://en.wikipedia.org/wiki/Truncated_normal_distribution"
                            target="_blank"
                            rel="nofollow"
                            >truncated normal distribution</a
                        >
                        in range of [0, infinity]
                    </li>
                    <li>
                        0-1 truncated normal - a two-sided
                        <a
                            href="https://en.wikipedia.org/wiki/Truncated_normal_distribution"
                            target="_blank"
                            rel="nofollow"
                            >truncated normal distribution</a
                        >
                        in range of [0, 1]
                    </li>
                </ul>
            </template>
        </HelpHintWrapper>
        <HelpHintWrapper v-if="node.function.distribution != DETERMINISTIC_DISTRIBUTION_TYPE">
            <template #default>
                <div class="lower-upper-inputs">
                    <v-number-input
                        v-model="lowerInputValue"
                        :precision="null"
                        label="Lower"
                        control-variant="split"
                        hide-details
                    ></v-number-input>
                    <v-number-input
                        v-model="upperInputValue"
                        :precision="null"
                        label="Upper"
                        control-variant="split"
                        hide-details
                    ></v-number-input>
                </div>
            </template>
            <template #tooltip>
                <p>
                    Select the lower and upper bounds to determine the parameters of the distribution. Lower and upper
                    bounds correspond to the 90% confidence interval of the distribution, i.e the 5%- and 95%-quantiles
                    of this estimate.
                </p>
                <p>
                    Note that for some distributions, e.g., the 0-1 truncated normal distribution, lower and upper
                    bounds cannot be chosen arbitrarily, but are subject to certain constraints, e.g., they must lie
                    within the interval of [0, 1].
                </p>
            </template>
        </HelpHintWrapper>
        <HelpHintWrapper v-else>
            <template #default>
                <div>
                    <v-number-input
                        v-model="lowerInputValue"
                        :precision="null"
                        label="Value"
                        control-variant="split"
                        hide-details
                    ></v-number-input>
                </div>
            </template>
            <template #tooltip> Choose a single constant value. </template>
        </HelpHintWrapper>
    </div>
</template>

<style lang="scss" scoped>
    .estimateFunctionTabContainer {
        display: flex;
        flex-direction: column;
        gap: 1em;
    }

    .lower-upper-inputs {
        display: flex;
        gap: 1em;
    }
</style>
