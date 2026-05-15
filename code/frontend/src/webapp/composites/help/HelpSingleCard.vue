<script setup lang="ts">
    import { useRoute } from "vue-router";

    import CardContainer from "../../components/layout/CardContainer.vue";
    import HelpCard from "./HelpCard.vue";

    const route = useRoute();
</script>

<template>
    <CardContainer>
        <HelpCard :path-array="Array.isArray(route.params.path) ? route.params.path : [route.params.path]" />
    </CardContainer>
</template>

<style scoped lang="scss"></style>
