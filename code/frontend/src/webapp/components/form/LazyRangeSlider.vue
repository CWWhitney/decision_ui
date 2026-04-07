<script setup lang="ts">
    import { clampInRange } from "@decision-support-ui/common";
    import * as tf from "@tensorflow/tfjs";

    import { ref, watch } from "vue";

    const model = defineModel<[number, number]>({
        required: true
    });

    const props = withDefaults(
        defineProps<{
            lowerBounds?: [number, number] | null;
            upperBounds?: [number, number] | null;
        }>(),
        {
            lowerBounds: null,
            upperBounds: null
        }
    );

    const emits = defineEmits<{
        change: [value: [number, number], old: [number, number]];
    }>();

    const sliderValue = ref<[number, number]>(model.value);

    watch(model, value => {
        sliderValue.value = value;
    });

    const onEnd = (nextValue: [number, number]) => {
        console.log(`LazyRangeSlider onEnd`);
        const nextValueClamped = [
            props.lowerBounds ? clampInRange(nextValue[0], props.lowerBounds) : nextValue[0],
            props.upperBounds ? clampInRange(nextValue[1], props.upperBounds) : nextValue[1]
        ] as [number, number];
        const previousValue = model.value;
        sliderValue.value = nextValueClamped;
        if (!tf.util.arraysEqual(nextValueClamped, previousValue)) {
            model.value = nextValueClamped;
            emits("change", nextValueClamped, previousValue);
        }
    };

    const focused = ref<boolean>(false);
</script>

<template>
    <v-range-slider
        v-model="sliderValue"
        :thumb-label="focused ? true : false"
        v-bind="$attrs"
        @end="onEnd"
        @focus="focused = true"
        @blur="focused = false"
    />
</template>

<style scoped lang="scss"></style>
