<script setup lang="ts">
    import { useFlowGraphStore } from "@/state/graph";
    import { useVueFlow } from "@vue-flow/core";
    import { onMounted, onUnmounted } from "vue";

    const { addSelectedNodes, getNodes, removeSelectedElements, zoomIn, zoomOut, zoomTo, fitView } =
        useVueFlow("editor");

    const graph = useFlowGraphStore();

    const props = defineProps<{ focused: boolean }>();

    const selectAllNodes = () => {
        addSelectedNodes(getNodes.value);
    };

    const onKeyDown = (e: KeyboardEvent) => {
        if (!props.focused) {
            return;
        }

        // undo (ctrl + z)
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "z") {
            e.preventDefault();
            graph.history.undo();
        }

        // redo (ctrl + shift + z)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "Z") {
            e.preventDefault();
            graph.history.redo();
        }

        // select all (ctrl + a)
        if ((e.ctrlKey || e.metaKey) && e.key === "a") {
            e.preventDefault();
            selectAllNodes();
        }

        // unselect all (ctrl + alt + a)
        if ((e.ctrlKey || e.metaKey) && e.altKey && e.key === "a") {
            e.preventDefault();
            removeSelectedElements();
        }

        // zoom in (ctrl + +)
        if ((e.ctrlKey || e.metaKey) && e.key === "+") {
            e.preventDefault();
            zoomIn();
        }

        // zoom out (ctrl + -)
        if ((e.ctrlKey || e.metaKey) && e.key === "-") {
            e.preventDefault();
            zoomOut();
        }

        // reset zoom (ctrl + #)
        if ((e.ctrlKey || e.metaKey) && e.key === "#") {
            e.preventDefault();
            zoomTo(1.0);
        }

        // zoom to fit (ctrl + .)
        if ((e.ctrlKey || e.metaKey) && e.key === ".") {
            e.preventDefault();
            fitView();
        }
    };

    onMounted(() => document.addEventListener("keydown", onKeyDown));
    onUnmounted(() => document.removeEventListener("keydown", onKeyDown));
</script>

<template>
    <div v-if="false" />
</template>
