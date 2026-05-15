<script setup lang="ts">
    import { useSnackbarStore } from "../../state/snackbar";

    const snackbar = useSnackbarStore();
</script>

<template>
    <v-snackbar-queue v-model="snackbar.messages" closable />
</template>
