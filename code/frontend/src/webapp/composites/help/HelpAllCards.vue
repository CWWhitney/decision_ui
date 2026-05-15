<script setup lang="ts">
    import HelpCard from "./HelpCard.vue";

    const allPages: string[][] = [
        [],
        ["installation"],
        ["installation", "windows"],
        ["installation", "macos"],
        ["installation", "linux"],
        ["getting-started"],
        ["user-interface"],
        ["user-interface", "main-menu"],
        ["user-interface", "main-menu", "login-dialog"],
        ["user-interface", "main-menu", "open-model-dialog"],
        ["user-interface", "main-menu", "save-model-dialog"],
        ["user-interface", "metadata"],
        ["user-interface", "model-editor"],
        ["user-interface", "model-editor", "node-edit-dialog"],
        ["user-interface", "model-editor", "node-edit-dialog", "general-tab"],
        ["user-interface", "model-editor", "node-edit-dialog", "function-tab"],
        ["user-interface", "model-editor", "node-edit-dialog", "data-tab"],
        ["user-interface", "model-editor", "node-edit-dialog", "analyze-tab"],
        ["user-interface", "model-editor", "node-edit-dialog", "style-tab"],
        ["user-interface", "model-editor", "node-edit-dialog", "formula-expression-input"],
        ["user-interface", "model-editor", "node-edit-dialog", "subgraphs"],
        ["user-interface", "analyze-model"],
        ["user-interface", "estimates-table"],
        ["user-interface", "r-backend"],
        ["developer-guide"]
    ];
</script>

<template>
    <div class="cardContainer">
        <HelpCard v-for="pathArray in allPages" :key="pathArray.join()" :path-array="pathArray" />
    </div>
</template>

<style scoped lang="scss">
    .cardContainer {
        display: flex;
        flex-direction: column;

        gap: 0.75em;
        padding: 0.75em;
    }
</style>
