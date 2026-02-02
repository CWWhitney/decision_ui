<script setup lang="ts">
    /**
     * Functions Tab of the Node Edit Dialog for Nodes with Operation or Result Function Type
     */
    import { debounce } from "@/common/throttle";
    import { ref, watch } from "vue";

    const model = defineModel<string>({
        required: true
    });
    const props = withDefaults(defineProps<{ debounceTime?: number; transform?: (text: string) => string }>(), {
        debounceTime: 300,
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
        debounce((v: string) => {
            const previousText = model.value;
            const newText = props.transform(v);
            model.value = newText;
            inputValue.value = newText;
            emits("change", newText, previousText);
        }, props.debounceTime)
    );
</script>

<template>
    <v-text-field v-model="inputValue" v-bind="$attrs"></v-text-field>
</template>

<style scoped lang="scss"></style>
