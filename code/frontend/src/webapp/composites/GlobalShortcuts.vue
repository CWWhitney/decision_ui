<script setup lang="ts">
    import { resetState } from "@/state";
    import { downloadModelFile, uploadModelFile } from "@/state/io";
    import { onMounted, onUnmounted } from "vue";

    const onKeyDown = (e: KeyboardEvent) => {
        // new file (alt + n)
        if (e.altKey && e.key === "n") {
            e.preventDefault();
            resetState();
        }

        // export as file (ctrl + e)
        if ((e.ctrlKey || e.metaKey) && e.key === "e") {
            e.preventDefault();
            downloadModelFile();
        }

        // import from file (ctrl + e)
        if ((e.ctrlKey || e.metaKey) && e.key === "i") {
            e.preventDefault();
            uploadModelFile();
        }
    };

    onMounted(() => document.addEventListener("keydown", onKeyDown));
    onUnmounted(() => document.removeEventListener("keydown", onKeyDown));
</script>

<template>
    <div v-if="false" />
</template>
