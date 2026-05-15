<script setup lang="ts">
    import { onMounted, onUnmounted } from "vue";
    import { useRouter } from "vue-router";

    import { resetState } from "../../state";
    import { useComputationStore } from "../../state/computation";
    import { useOpenModelDialogStore } from "../../state/open_model";
    import { useSaveModelDialogStore } from "../../state/save_model_dialog";
    import { useUnsavedModelDialogStore } from "../..//state/unsaved_model";
    import { useRStore } from "../../state/r";

    const openModelDialog = useOpenModelDialogStore();
    const saveModelDialog = useSaveModelDialogStore();
    const unsavedModelDialog = useUnsavedModelDialogStore();
    const computation = useComputationStore();
    const rStore = useRStore();
    const router = useRouter();

    const onKeyDown = (e: KeyboardEvent) => {
        // new file (alt + n)
        if (e.altKey && e.key === "n") {
            e.preventDefault();
            unsavedModelDialog.openDialog(() => {
                resetState();
            });
        }

        // open file dialog (ctrl + o)
        if ((e.ctrlKey || e.metaKey) && e.key === "o") {
            e.preventDefault();
            unsavedModelDialog.openDialog(() => {
                openModelDialog.openDialog();
            });
        }

        // save current (ctrl + s)
        if ((e.ctrlKey || e.metaKey) && e.key === "s") {
            e.preventDefault();
            saveModelDialog.saveCurrent();
        }

        // save current (ctrl + s)
        if ((e.ctrlKey || e.metaKey) && e.key === "s") {
            e.preventDefault();
            saveModelDialog.saveCurrent();
        }

        // save as file (ctrl + shift + s)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "S") {
            e.preventDefault();
            saveModelDialog.openDialog();
        }

        // open documentation (ctrl + h)
        if ((e.ctrlKey || e.metaKey) && e.key === "h") {
            e.preventDefault();
            router.push({ path: "/help" });
        }

        // got to github (ctrl + b)
        if ((e.ctrlKey || e.metaKey) && e.key === "b") {
            e.preventDefault();
            window.open("https://github.com/CWWhitney/decision_ui/issues", "_blank");
        }

        // trigger recalculation (ctrl + 2)
        if ((e.ctrlKey || e.metaKey) && e.key === "2") {
            e.preventDefault();
            computation.triggerRecalculation();
        }

        // trigger R result histogram calculation (ctrl + 3)
        if ((e.ctrlKey || e.metaKey) && e.key === "3") {
            e.preventDefault();
            rStore.calculateResultHistogram();
            router.push({ name: "rTabs", params: { variantTab: "histogram", displayTab: "diagram" } });
        }

        // trigger R evpi calculation (ctrl + 4)
        if ((e.ctrlKey || e.metaKey) && e.key === "4") {
            e.preventDefault();
            rStore.calculateEvpi();
            router.push({ name: "rTabs", params: { variantTab: "evpi", displayTab: "diagram" } });
        }
    };

    onMounted(() => document.addEventListener("keydown", onKeyDown));
    onUnmounted(() => document.removeEventListener("keydown", onKeyDown));
</script>

<template>
    <div v-if="false" />
</template>
