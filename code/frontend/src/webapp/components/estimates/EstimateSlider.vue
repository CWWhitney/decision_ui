<script setup lang="ts">
    import * as common from "@decision-support-ui/common";
    import EstimateDeterministicSlider from "./EstimateDeterministicSlider.vue";
    import EstimateProbabilisticSlider from "./EstimateProbabilisticSlider.vue";

    const node = defineModel<common.AbstractNode<common.VariableNodeType, common.EstimateNodeFunctionState, any>>({
        required: true
    });
</script>

<template>
    <div class="estimateSliderContainer">
        <EstimateDeterministicSlider
            v-if="node.function.distribution == common.DETERMINISTIC_DISTRIBUTION_TYPE"
            v-model="node"
        />
        <EstimateProbabilisticSlider v-else v-model="node" />
    </div>
</template>

<style lang="scss" scoped>
    .estimateSliderContainer {
        position: relative;
    }
</style>
