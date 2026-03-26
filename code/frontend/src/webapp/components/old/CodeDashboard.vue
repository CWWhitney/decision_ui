<script setup lang="ts">
    import Dashboard from "../layout/CardContainer.vue";
    import CodeDisplay from "../../composites/rcode/RCodeTab.vue";
    import GeneratedEstimatesTable from "./GeneratedEstimatesTable.vue";
</script>

<template>
    <Dashboard>
        <CodeDisplay />
        <GeneratedEstimatesTable />
    </Dashboard>
</template>
