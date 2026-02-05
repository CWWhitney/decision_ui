<script lang="ts" setup>
    const props = defineProps<{ title: string; shortcut?: string; disabled?: boolean }>();
    const emits = defineEmits(["click"]);
</script>

<template>
    <v-list-item class="menu-item" :disabled="props.disabled" @click="() => emits('click')">
        <template #title>{{ props.title }}</template>
        <template v-if="props.shortcut" #append
            ><span class="shortcut">{{ props.shortcut }}</span></template
        >
    </v-list-item>
</template>

<style lang="scss" scoped>
    .menu-item {
        min-width: 20em;
    }

    .shortcut {
        opacity: 0.7;
        font-size: 0.8em;
        margin-left: 2em;
    }
</style>
