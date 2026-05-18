<script setup lang="ts">
    import AiSupportDialog from "../dialogs/AiSupportDialog.vue";
    import ErrorDialog from "../dialogs/ErrorDialog.vue";
    import LoginDialog from "../dialogs/LoginDialog.vue";
    import OpenModelDialog from "../dialogs/OpenModelDialog.vue";
    import SaveModelDialog from "../dialogs/SaveModelDialog.vue";
    import UnsavedModelDialog from "../dialogs/UnsavedModelDialog.vue";
</script>

<template>
    <OpenModelDialog />
    <SaveModelDialog />
    <AiSupportDialog />
    <LoginDialog />
    <ErrorDialog />
    <UnsavedModelDialog />
</template>
