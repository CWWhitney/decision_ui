<script setup lang="ts">
    import * as common from "@decision-support-ui/common";
    import HelpHintWrapper from "../../form/HelpHintWrapper.vue";
    import DebouncedNumberInput from "../../form/DebouncedNumberInput.vue";

    const node = defineModel<common.AbstractNode<common.VariableNodeType, common.EstimateNodeFunctionState, any>>({
        required: true
    });

    const DISTRIBUTION_VALUES = common.DISTRIBUTION_TYPES.map(dt => ({
        title: common.DISTRIBUTION_LABELS[dt],
        value: dt
    }));

    const onLowerValueChange = (v: number) => {
        node.value.function.lowerBounds = common.extendRange(v, node.value.function.lowerBounds);
    };

    const onUpperValueChange = (v: number) => {
        node.value.function.upperBounds = common.extendRange(v, node.value.function.upperBounds);
    };

    const onDeterministicValueChange = (v: number) => {
        node.value.function.upper = v;
        node.value.function.lowerBounds = common.extendRange(v, node.value.function.lowerBounds);
        node.value.function.upperBounds = [...node.value.function.lowerBounds];
    };
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
        <HelpHintWrapper v-if="node.function.distribution != common.DETERMINISTIC_DISTRIBUTION_TYPE">
            <template #default>
                <div class="lower-upper-inputs">
                    <DebouncedNumberInput
                        v-model="node.function.lower"
                        :precision="null"
                        label="Lower"
                        control-variant="split"
                        hide-details
                        @change="onLowerValueChange"
                    />
                    <DebouncedNumberInput
                        v-model="node.function.upper"
                        :precision="null"
                        label="Upper"
                        control-variant="split"
                        hide-details
                        @change="onUpperValueChange"
                    />
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
                    <DebouncedNumberInput
                        v-model="node.function.lower"
                        :precision="null"
                        label="Value"
                        control-variant="split"
                        hide-details
                        @change="onDeterministicValueChange"
                    />
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
