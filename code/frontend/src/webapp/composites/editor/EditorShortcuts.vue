<script setup lang="ts">
    import { useEditorStore } from "@/state/editor";
    import { useGraphStore } from "@/state/graph";
    import { insertGraphFromClipboard, saveGraphFileToClipboard } from "@/state/io";
    import type { Position } from "@decision-support-ui/common";
    import { useVueFlow } from "@vue-flow/core";
    import { onMounted, onUnmounted } from "vue";

    const {
        addSelectedNodes,
        getNodes,
        removeSelectedElements,
        zoomIn,
        zoomOut,
        zoomTo,
        fitView,
        removeEdges,
        removeNodes,
        getSelectedNodes,
        getSelectedEdges,
        multiSelectionActive
    } = useVueFlow("editor");

    const graph = useGraphStore();
    const editor = useEditorStore();

    const props = defineProps<{ focused: boolean; lastMouseFlowPosition: Position }>();

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

        // unselect all (ctrl + shift + a)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "A") {
            e.preventDefault();
            removeSelectedElements();
        }

        // create subgraph from selection (ctrl + g)
        if ((e.ctrlKey || e.metaKey) && e.key === "g") {
            e.preventDefault();
            editor.createSubgraphFromSelection(getSelectedNodes.value.map(n => n.id));
        }

        // cut (ctrl + x)
        if ((e.ctrlKey || e.metaKey) && e.key === "x") {
            e.preventDefault();
            saveGraphFileToClipboard(getSelectedNodes.value.map(n => n.id));
            removeEdges(getSelectedEdges.value);
            removeNodes(getSelectedNodes.value);
        }

        // copy (ctrl + c)
        if ((e.ctrlKey || e.metaKey) && e.key === "c") {
            e.preventDefault();
            saveGraphFileToClipboard(getSelectedNodes.value.map(n => n.id));
        }

        // copy (ctrl + v)
        if ((e.ctrlKey || e.metaKey) && e.key === "v") {
            e.preventDefault();
            insertGraphFromClipboard(props.lastMouseFlowPosition, editor.state.subgraphId);
            // disable multi selection which gets stuck on firefox due to paste-confirm dialog
            multiSelectionActive.value = false;
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
