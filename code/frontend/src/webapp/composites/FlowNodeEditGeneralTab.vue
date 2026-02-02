<script setup lang="ts">
    import DebouncedTextInput from "@/components/flow/DebouncedTextInput.vue";
    import {
        ESTIMATE_FUNCTION_TYPE,
        generateVariableName,
        VARIABLE_NODE_TYPE,
        type Node
    } from "@decision-support-ui/common";

    const node = defineModel<Node>({ required: true });

    const onTitleChange = (title: string, previous: string) => {
        if (node.value.type == VARIABLE_NODE_TYPE) {
            if (generateVariableName(previous) == node.value.function.variable) {
                // auto-change variable in case it matches the default naming scheme
                node.value.function.variable = generateVariableName(title);
            }
        }
    };
</script>

<template>
    <div>
        <DebouncedTextInput v-model="node.visualization.title" label="Title" required @change="onTitleChange" />
        <div v-if="node.function.type == ESTIMATE_FUNCTION_TYPE">
            <v-text-field v-model="node.function.comment" label="Comment for Estimate in CSV"></v-text-field>
        </div>
    </div>
</template>

<style scoped lang="scss">
    .v-text-field {
        min-width: 18em;
    }
</style>
