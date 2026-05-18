<script setup lang="ts">
    import { onMounted, onUnmounted } from "vue";
    import { useVueFlow } from "@vue-flow/core";
    import type { Position } from "@decision-support-ui/common";

    import { useEditorStore } from "../../state/editor";
    import { useGraphStore } from "../../state/graph";
    import { generateInsertGraphFromClipboard, saveGraphFileToClipboard } from "../../state/io";
    import { useSnackbarStore } from "../../state/snackbar";

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
    const snackbar = useSnackbarStore();

    const insertGraphFromClipboard = generateInsertGraphFromClipboard();

    const props = defineProps<{ focused: boolean; lastMouseFlowPosition: Position }>();

    const selectAllNodes = () => {
        addSelectedNodes(getNodes.value);
    };

    const onKeyDown = (e: KeyboardEvent) => {
        if (!props.focused) {
            return;
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

        if (editor.persisted.locked) {
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
            const nodeIds = getSelectedNodes.value.map(n => n.id);
            if (nodeIds.length > 0) {
                saveGraphFileToClipboard(nodeIds);
                removeEdges(getSelectedEdges.value);
                removeNodes(getSelectedNodes.value);
                snackbar.addSuccessMessage(`Successfully extracted ${nodeIds.length} nodes to clipboard!`);
            }
        }

        // copy (ctrl + c)
        if ((e.ctrlKey || e.metaKey) && e.key === "c") {
            e.preventDefault();
            const nodeIds = getSelectedNodes.value.map(n => n.id);
            if (nodeIds.length > 0) {
                saveGraphFileToClipboard(nodeIds);
                snackbar.addSuccessMessage(`Successfully copied ${nodeIds.length} nodes to clipboard!`);
            }
        }

        // copy (ctrl + v)
        if ((e.ctrlKey || e.metaKey) && e.key === "v") {
            e.preventDefault();
            insertGraphFromClipboard(props.lastMouseFlowPosition, editor.transient.subgraphId);
            // disable multi selection which gets stuck on firefox due to paste-confirm dialog
            multiSelectionActive.value = false;
        }
    };

    onMounted(() => document.addEventListener("keydown", onKeyDown));
    onUnmounted(() => document.removeEventListener("keydown", onKeyDown));
</script>

<template>
    <div v-if="false" />
</template>
