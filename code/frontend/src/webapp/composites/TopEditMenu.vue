<script setup lang="ts">
    import TopMenuItem from "@/components/flow/TopMenuItem.vue";
    import { useVueFlow } from "@vue-flow/core";
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

    const route = useRoute();
    const isEditorRoute = route.name == "editor";

    const removeNodesOrEdges = () => {
        removeEdges(getSelectedEdges.value);
        removeNodes(getSelectedNodes.value);
    };

    const selectAllNodes = () => {
        addSelectedNodes(getNodes.value);
    };
</script>

<template>
    <v-card class="card">
        <v-list class="list">
            <TopMenuItem title="Undo" shortcut="CTRL + Z" disabled @click="console.log('undo click')" />
            <TopMenuItem title="Redo" shortcut="CTRL + SHIFT + Z" disabled @click="console.log('redo click')" />
            <v-divider />
            <TopMenuItem
                title="Select All Nodes"
                shortcut="CTRL + A"
                :disabled="!isEditorRoute"
                @click="selectAllNodes"
            />
            <TopMenuItem
                title="Unselect All"
                shortcut="CTRL + ALT + A"
                :disabled="!isEditorRoute"
                @click="removeSelectedElements"
            />
            <v-divider />

            <v-divider />
            <TopMenuItem title="Cut" shortcut="CTRL + X" disabled @click="console.log('cut click')" />
            <TopMenuItem title="Copy" shortcut="CTRL + C" disabled @click="console.log('copy click')" />
            <TopMenuItem title="Paste" shortcut="CTRL + V" disabled @click="console.log('paste click')" />
            <v-divider />
            <TopMenuItem title="Remove" shortcut="BACKSPACE" :disabled="!isEditorRoute" @click="removeNodesOrEdges" />
        </v-list>
    </v-card>
</template>

<style lang="scss" scoped></style>
