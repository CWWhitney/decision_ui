<script setup lang="ts">
    import { type Node, NODE_STYLE_BORDER_VARIANTS } from "@decision-support-ui/common";

    const node = defineModel<Node>({ required: true });
</script>

<template>
    <v-combobox
        v-model="node.visualization.style.border"
        label="Border Variant"
        :items="NODE_STYLE_BORDER_VARIANTS"
    ></v-combobox>
</template>

<style scoped lang="scss">
    .v-text-field {
        min-width: 25em;
    }
</style>
