<script setup lang="ts">
    import TopMenuItem from "@/components/flow/TopMenuItem.vue";
    import { useFlowOptionsStore } from "@/state/flow/options";
    import { useFlowStyleStore } from "@/state/flow/style";
    import { useVueFlow } from "@vue-flow/core";

    const { fitView, zoomTo, zoomIn, zoomOut } = useVueFlow("editor");

    const optionsStore = useFlowOptionsStore();
    const styleStore = useFlowStyleStore();
</script>

<template>
    <v-card class="card">
        <v-list class="list">
            <TopMenuItem title="Zoom In" @click="zoomIn" />
            <TopMenuItem title="Zoom Out" @click="zoomOut" />
            <TopMenuItem title="Zoom to Fit" @click="fitView" />
            <TopMenuItem title="Reset Zoom" @click="() => zoomTo(1.0)" />
            <v-divider />
            <TopMenuItem
                :title="optionsStore.locked ? 'Unlock Graph' : 'Lock Graph'"
                @click="optionsStore.toggleLocked"
            />
            <v-divider />
            <TopMenuItem title="Change Edge Style" @click="styleStore.switchEdgeType" />
            <TopMenuItem title="Change Background" @click="styleStore.switchBackground" />
        </v-list>
    </v-card>
</template>

<style lang="scss" scoped></style>
