<script setup lang="ts">
    import TopMenuItem from "@/components/menu/TopMenuItem.vue";
    import { useEditorStore } from "@/state/editor";
    import { useGraphStore } from "@/state/graph";
    import { insertGraphFromClipboard, saveGraphFileToClipboard } from "@/state/io";
    import type { Position } from "@decision-support-ui/common";
    import { useVueFlow } from "@vue-flow/core";
    import { computed } from "vue";
    import { useRoute } from "vue-router";

    const {
        removeSelectedElements,
        getSelectedNodes,
        getSelectedEdges,
        removeNodes,
        removeEdges,
        addSelectedNodes,
        getNodes
    } = useVueFlow("editor");

    const graph = useGraphStore();
    const editor = useEditorStore();

    const route = useRoute();
    const isEditorRoute = route.name == "editor";

    const removeNodesOrEdges = () => {
        removeEdges(getSelectedEdges.value);
        removeNodes(getSelectedNodes.value);
    };

    const selectAllNodes = () => {
        addSelectedNodes(getNodes.value);
    };

    const onCopyClick = () => {
        saveGraphFileToClipboard(getSelectedNodes.value.map(n => n.id));
    };

    const onCutClick = () => {
        saveGraphFileToClipboard(getSelectedNodes.value.map(n => n.id));
        removeNodesOrEdges();
    };

    const onPasteClick = () => {
        insertGraphFromClipboard(
            {
                x: window.innerWidth / 2.0,
                y: window.innerHeight / 2.0
            } as Position,
            editor.state.subgraphId
        );
    };

    const nothingIsSelected = computed(() => getSelectedNodes.value.length == 0 && getSelectedEdges.value.length == 0);
</script>

<template>
    <v-card class="card">
        <v-list class="list">
            <TopMenuItem
                title="Undo"
                shortcut="CTRL + Z"
                :disabled="!graph.history.canUndo || editor.state.locked"
                @click="graph.history.undo"
            />
            <TopMenuItem
                title="Redo"
                shortcut="CTRL + SHIFT + Z"
                :disabled="!graph.history.canRedo || editor.state.locked"
                @click="graph.history.redo"
            />
            <v-divider />
            <TopMenuItem
                title="Select All Nodes"
                shortcut="CTRL + A"
                :disabled="!isEditorRoute"
                @click="selectAllNodes"
            />
            <TopMenuItem
                title="Unselect All"
                shortcut="CTRL + SHIFT + A"
                :disabled="!isEditorRoute || nothingIsSelected"
                @click="removeSelectedElements"
            />
            <v-divider />
            <TopMenuItem
                title="Create Subgraph from Selection"
                shortcut="CTRL + G"
                :disabled="!isEditorRoute || getSelectedNodes.length == 0"
                @click="editor.createSubgraphFromSelection(getSelectedNodes.map(n => n.id))"
            />
            <v-divider />
            <TopMenuItem
                title="Cut"
                shortcut="CTRL + X"
                :disabled="!isEditorRoute || getSelectedNodes.length == 0"
                @click="onCutClick"
            />
            <TopMenuItem
                title="Copy"
                shortcut="CTRL + C"
                :disabled="!isEditorRoute || getSelectedNodes.length == 0"
                @click="onCopyClick"
            />
            <TopMenuItem title="Paste" shortcut="CTRL + V" :disabled="!isEditorRoute" @click="onPasteClick" />
            <v-divider />
            <TopMenuItem
                title="Remove"
                shortcut="BACKSPACE"
                :disabled="!isEditorRoute || nothingIsSelected || editor.state.locked"
                @click="removeNodesOrEdges"
            />
        </v-list>
    </v-card>
</template>

<style lang="scss" scoped></style>
