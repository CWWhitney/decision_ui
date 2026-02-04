<script setup lang="ts">
    /**
     * Functions Tab of the Node Edit Dialog for Nodes with Loop Function Type
     */
    import { USER_INPUT_DEBOUNCE_TIME } from "@/common/constants";
    import { debounce } from "@/common/throttle";
    import { AVAILABLE_DISTRIBUTIONS } from "@/editor/distributions";
    import {
        type AbstractNode,
        type EstimateNodeFunctionState,
        type VariableNodeType,
        DETERMINISTIC_DISTRIBUTION_TYPE
    } from "@decision-support-ui/common";
    import { computed, ref, watch } from "vue";
    import HelpHintWrapper from "./HelpHintWrapper.vue";

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
</script>

<template>
    <div class="estimateFunctionTabContainer">
        <div>The value of this node is sampled from the following probabilistic distribution:</div>
        <HelpHintWrapper>
            <template #default>
                <v-combobox
                    v-model="node.function.distribution"
                    label="Distribution"
                    :items="AVAILABLE_DISTRIBUTIONS"
                    hide-details
                ></v-combobox>
            </template>
            <template #tooltip> text </template>
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
        </HelpHintWrapper>
        <HelpHintWrapper v-else>
            <template #default>
                <div>
                    <v-number-input
                        v-model="lowerInputValue"
                        :precision="null"
                        label="Value"
                        control-variant="split"
                    ></v-number-input>
                </div>
            </template>
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
