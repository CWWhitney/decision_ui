<script setup lang="ts">
    import { useEditorStore } from "../../state/editor";
    import TopMenuItem from "../../components/menu/TopMenuItem.vue";
    import { resetState } from "../../state";
    import { useOpenModelDialogStore } from "../../state/open_model";
    import { useSaveModelDialogStore } from "../../state/save_model_dialog";

    const openModelDialog = useOpenModelDialogStore();
    const saveModelDialog = useSaveModelDialogStore();
    const editor = useEditorStore();
</script>

<template>
    <v-card class="card">
        <v-list class="list">
            <TopMenuItem title="New" shortcut="ALT + N" @click="resetState" />
            <v-divider />
            <TopMenuItem title="Open..." shortcut="CTRL + O" @click="openModelDialog.openDialog()" />
            <TopMenuItem title="Save" shortcut="CTRL + S" @click="saveModelDialog.saveCurrent()" />
            <TopMenuItem title="Save As..." shortcut="CTRL + SHIFT + S" @click="saveModelDialog.openDialog()" />
            <v-divider />
            <v-list-item
                class="autosaveToggle"
                :disabled="!saveModelDialog.isAutosaveAvailable"
                @click="editor.toggleAutosave"
            >
                <template #title>Autosave every 5 Minutes</template>
                <template #append>
                    <v-switch
                        v-model="editor.persisted.autosave"
                        color="primary"
                        :disabled="!saveModelDialog.isAutosaveAvailable"
                        density="compact"
                        hide-details
                        inset
                    />
                </template>
            </v-list-item>
        </v-list>
    </v-card>
</template>

<style lang="scss" scoped></style>
