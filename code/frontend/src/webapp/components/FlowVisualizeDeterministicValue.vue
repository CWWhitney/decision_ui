<script setup lang="ts">
    import { numberToPrettyString } from "@decision-support-ui/common";

    const props = defineProps<{ value: number }>();
</script>

<template>
    {{ numberToPrettyString(props.value) }}
</template>

<style scoped lang="scss"></style>
