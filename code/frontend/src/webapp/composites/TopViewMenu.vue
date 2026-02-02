<script setup lang="ts">
    import TopMenuItem from "@/components/flow/TopMenuItem.vue";
    import { useEditorSettingsStore } from "@/state/settings";
    import { useVueFlow } from "@vue-flow/core";

    const { fitView, zoomTo, zoomIn, zoomOut } = useVueFlow("editor");

    const editorSettings = useEditorSettingsStore();
</script>

<template>
    <v-card class="card">
        <v-list class="list">
            <TopMenuItem title="Zoom In" shortcut="CTRL + PLUS" @click="zoomIn" />
            <TopMenuItem title="Zoom Out" shortcut="CTRL + MINUS" @click="zoomOut" />
            <TopMenuItem title="Zoom to Fit" shortcut="CTRL + ." @click="fitView" />
            <TopMenuItem title="Reset Zoom" shortcut="CTRL + #" @click="() => zoomTo(1.0)" />
            <v-divider />
            <TopMenuItem
                :title="editorSettings.locked ? 'Unlock Graph' : 'Lock Graph'"
                @click="editorSettings.toggleLocked"
            />
            <TopMenuItem
                :title="editorSettings.snapToGrid ? 'Switch to Free Movement' : 'Switch to Snap to Grid'"
                @click="editorSettings.toggleSnapToGrid"
            />
            <v-divider />
            <TopMenuItem title="Change Edge Style" @click="editorSettings.switchEdgeStyle" />
            <TopMenuItem title="Change Background" @click="editorSettings.switchBackground" />
        </v-list>
    </v-card>
</template>

<style lang="scss" scoped></style>
