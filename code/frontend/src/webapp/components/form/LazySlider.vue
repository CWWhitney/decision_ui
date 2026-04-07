<script setup lang="ts">
    import { ref, watch } from "vue";

    const model = defineModel<number>({
        required: true
    });

    const emits = defineEmits<{
        change: [value: number, old: number];
    }>();

    const sliderValue = ref<number>(model.value);

    watch(model, value => {
        sliderValue.value = value;
    });

    const onEnd = (newValue: number) => {
        const previousValue = model.value;
        if (newValue != previousValue) {
            model.value = newValue;
            emits("change", newValue, previousValue);
        }
    };

    const focused = ref<boolean>(false);
</script>

<template>
    <v-slider
        v-model="sliderValue"
        :thumb-label="focused ? true : false"
        v-bind="$attrs"
        @end="onEnd"
        @focus="focused = true"
        @blur="focused = false"
    />
</template>

<style scoped lang="scss"></style>
