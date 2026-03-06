<script setup lang="ts">
    import { resetState } from "@/state";
    import { useComputationStore } from "@/state/computation";
    import { useOpenModelDialogStore } from "@/state/open_model";
    import { useSaveModelDialogStore } from "@/state/save_model_dialog";
    import { onMounted, onUnmounted } from "vue";
    import { useRouter } from "vue-router";

    const openModelDialog = useOpenModelDialogStore();
    const saveModelDialog = useSaveModelDialogStore();
    const computation = useComputationStore();
    const router = useRouter();

    const onKeyDown = (e: KeyboardEvent) => {
        // new file (alt + n)
        if (e.altKey && e.key === "n") {
            e.preventDefault();
            resetState();
        }

        // open file dialog (ctrl + o)
        if ((e.ctrlKey || e.metaKey) && e.key === "o") {
            e.preventDefault();
            openModelDialog.openDialog();
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

        // export as file (ctrl + shift + s)
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
            window.open("https://github.com/johanneskopton/decision_ui/issues", "_blank");
        }

        // trigger recalculation (ctrl + 2)
        if ((e.ctrlKey || e.metaKey) && e.key === "2") {
            e.preventDefault();
            computation.triggerRecalculation();
        }
    };

    onMounted(() => document.addEventListener("keydown", onKeyDown));
    onUnmounted(() => document.removeEventListener("keydown", onKeyDown));
</script>

<template>
    <div v-if="false" />
</template>
