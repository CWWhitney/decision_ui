<script setup lang="ts">
    import * as common from "@decision-support-ui/common";
    import { computed } from "vue";
    import LazyRangeSlider from "../form/LazyRangeSlider.vue";

    const node = defineModel<common.AbstractNode<common.VariableNodeType, common.EstimateNodeFunctionState, any>>({
        required: true
    });

    const sliderModel = computed<[number, number]>({
        get: () => {
            return [node.value.function.lower, node.value.function.upper] as [number, number];
        },
        set: ([lower, upper]: [number, number]) => {
            node.value.function.lower = common.clampInRange(lower, node.value.function.lowerBounds);
            node.value.function.upper = common.clampInRange(upper, node.value.function.upperBounds);
        }
    });

    const combinedMin = computed(() =>
        Math.min(node.value.function.lowerBounds[0], node.value.function.upperBounds[0])
    );
    const combinedMax = computed(() =>
        Math.max(node.value.function.lowerBounds[1], node.value.function.upperBounds[1])
    );
</script>

<template>
    <div class="probabilisticEstimateSliderContainer">
        <div class="labelRow">
            <span>{{ node.visualization.title }}</span>
        </div>
        <div class="sliderRow">
            <span>{{ combinedMin }}</span>
            <LazyRangeSlider
                v-model="sliderModel"
                :min="combinedMin"
                :max="combinedMax"
                :step="node.function.rangeStep"
                :lower-bounds="node.function.lowerBounds"
                :upper-bounds="node.function.upperBounds"
                hide-details
                class="slider"
            />
            <span>{{ combinedMax }}</span>
        </div>
        <div class="valueRow">
            <span>lower = {{ node.function.lower }} &nbsp;&nbsp; upper = {{ node.function.upper }}</span>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    .labelRow {
        font-weight: 400;
        font-size: 13pt;
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
    }

    .probabilisticEstimateSliderContainer {
        display: flex;
        flex-direction: column;
        gap: 0.5em;
    }
</style>
