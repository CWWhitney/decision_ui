<script setup lang="ts">
    import { ref, watch } from "vue";
    import { debounce } from "@decision-support-ui/common";

    import { USER_INPUT_DEBOUNCE_TIME } from "../../common/constants";

    const model = defineModel<number>({
        required: true
    });
    const props = withDefaults(defineProps<{ debounceTime?: number; transform?: (value: number) => number }>(), {
        debounceTime: USER_INPUT_DEBOUNCE_TIME,
        transform: (text: number) => text
    });
    const emits = defineEmits<{
        change: [value: number, old: number];
    }>();

    const inputValue = ref<number>(model.value);

    watch(model, value => {
        inputValue.value = value;
    });

    watch(
        inputValue,
        debounce((nextValue: number) => {
            const previousValue = model.value;
            nextValue = props.transform(nextValue);
            if (previousValue != nextValue) {
                model.value = nextValue;
                emits("change", nextValue, previousValue);
            }
            if (inputValue.value != nextValue) {
                inputValue.value = nextValue;
            }
        }, props.debounceTime)
    );
</script>

<template>
    <v-number-input v-model="inputValue" v-bind="$attrs"></v-number-input>
</template>

<style scoped lang="scss"></style>
