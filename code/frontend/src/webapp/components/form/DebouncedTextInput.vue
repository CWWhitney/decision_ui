<script setup lang="ts">
    /**
     * Functions Tab of the Node Edit Dialog for Nodes with Operation or Result Function Type
     */
    import { USER_INPUT_DEBOUNCE_TIME } from "@/common/constants";
    import { debounce } from "@/common/throttle";
    import { ref, watch } from "vue";

    const model = defineModel<string>({
        required: true
    });
    const props = withDefaults(defineProps<{ debounceTime?: number; transform?: (text: string) => string }>(), {
        debounceTime: USER_INPUT_DEBOUNCE_TIME,
        transform: (text: string) => text
    });
    const emits = defineEmits<{
        change: [value: string, old: string];
    }>();

    const inputValue = ref<string>(model.value);

    watch(model, value => {
        inputValue.value = value;
    });

    watch(
        inputValue,
        debounce((nextText: string) => {
            const previousText = model.value;
            nextText = props.transform(nextText);
            if (previousText != nextText) {
                model.value = nextText;
                emits("change", nextText, previousText);
            }
            if (inputValue.value != nextText) {
                inputValue.value = nextText;
            }
        }, props.debounceTime)
    );
</script>

<template>
    <v-text-field v-model="inputValue" v-bind="$attrs"></v-text-field>
</template>

<style scoped lang="scss"></style>
