<script setup lang="ts">
    import Dashboard from "../layout/WorkspaceCards.vue";
    import CodeDisplay from "./CodeDisplay.vue";
    import GeneratedEstimatesTable from "./GeneratedEstimatesTable.vue";
</script>

<template>
    <Dashboard>
        <CodeDisplay />
        <GeneratedEstimatesTable />
    </Dashboard>
</template>
