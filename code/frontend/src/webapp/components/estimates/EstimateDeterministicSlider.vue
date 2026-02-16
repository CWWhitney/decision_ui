<script setup lang="ts">
    import * as common from "@decision-support-ui/common";
    import { computed } from "vue";
    import LazySlider from "../form/LazySlider.vue";

    const node = defineModel<common.AbstractNode<common.VariableNodeType, common.EstimateNodeFunctionState, any>>({
        required: true
    });

    const sliderModel = computed<number>({
        get: () => {
            return node.value.function.lower;
        },
        set: (value: number) => {
            node.value.function.lower = value;
            node.value.function.upper = value;
        }
    });
</script>

<template>
    <div class="estimateSliderContainer">
        <div class="labelRow">
            <span>{{ node.visualization.title }}</span>
        </div>
        <div class="sliderRow">
            <span>{{ node.function.lowerBounds[0] }}</span>
            <LazySlider
                v-model="sliderModel"
                :min="node.function.lowerBounds[0]"
                :max="node.function.lowerBounds[1]"
                :step="node.function.rangeStep"
                hide-details
                class="slider"
            />
            <span>{{ node.function.lowerBounds[1] }}</span>
        </div>
        <div class="valueRow">
            <span>constant = {{ node.function.lower }}</span>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    .labelRow {
        font-weight: 400;
        font-size: 12pt;
    }

    .sliderRow {
        display: flex;
        align-items: center;
    }

    .valueRow {
        text-align: center;
        display: flex;
        flex-direction: column;
    }

    .slider {
        margin: 0 1.5em;

        :deep(.v-slider-track__fill) {
            opacity: 0;
        }
    }

    .probabilisticEstimateSliderContainer {
        display: flex;
        flex-direction: column;
        gap: 0.5em;
    }
</style>
