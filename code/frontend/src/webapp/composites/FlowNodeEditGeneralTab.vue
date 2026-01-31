<script setup lang="ts">
    import { ESTIMATE_FUNCTION_TYPE, type Node } from "@decision-support-ui/common";

    const node = defineModel<Node>({ required: true });
</script>

<template>
    <div>
        <v-text-field v-model="node.visualization.title" label="Title" required></v-text-field>
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
