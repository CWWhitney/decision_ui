<script setup lang="ts">
    import TopMenuItem from "@/components/menu/TopMenuItem.vue";
    import { useEditorStore } from "@/state/editor";
    import { useVueFlow } from "@vue-flow/core";

    const { fitView, zoomTo, zoomIn, zoomOut } = useVueFlow("editor");

    const editor = useEditorStore();
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
                :title="editor.persisted.locked ? 'Unlock Graph' : 'Lock Graph'"
                @click="editor.toggleLocked"
            />
            <TopMenuItem
                :title="editor.persisted.snapToGrid ? 'Enable Free Movement' : 'Enable Snap to Grid'"
                @click="editor.toggleSnapToGrid"
            />
            <v-divider />
            <TopMenuItem title="Change Edge Style" @click="editor.switchEdgeStyle" />
            <TopMenuItem title="Change Background" @click="editor.switchBackground" />
            <v-divider />
            <TopMenuItem
                :title="
                    editor.persisted.autoAddComputationEdges
                        ? 'Disable Auto-Connect Nodes'
                        : 'Enable Auto-Connect Nodes'
                "
                @click="editor.toggleAutoAddComputationEdges"
            />
        </v-list>
    </v-card>
</template>

<style lang="scss" scoped></style>
