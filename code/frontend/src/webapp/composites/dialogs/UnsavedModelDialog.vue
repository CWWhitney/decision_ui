<script lang="ts" setup>
    import { useUnsavedModelDialogStore } from "../../state/unsaved_model";

    const unsavedModelDialog = useUnsavedModelDialogStore();
</script>

<template>
    <v-dialog
        v-model="unsavedModelDialog.isOpen"
        :width="'auto'"
        :height="'auto'"
        class="unsavedModelDialog"
        @click:outside="unsavedModelDialog.closeAndCancel()"
    >
        <v-card>
            <v-toolbar>
                <v-toolbar-title>Unsaved Changes</v-toolbar-title>
                <v-toolbar-items>
                    <v-btn icon="mdi-close" @click="unsavedModelDialog.closeAndCancel()"></v-btn>
                </v-toolbar-items>
            </v-toolbar>
            <v-card-text>
                <p>Your model has changes that were not yet saved. Would you like to save your model first?</p>
            </v-card-text>
            <v-card-actions>
                <div>
                    <v-btn @click="unsavedModelDialog.closeAndCancel()">Cancel</v-btn>
                    <v-btn @click="unsavedModelDialog.closeWithoutSaving()">Continue Without Saving</v-btn>
                </div>
                <div>
                    <v-btn color="primary" @click="unsavedModelDialog.closeAndSave()">Save and Continue</v-btn>
                </div>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<style lang="scss" scoped>
    .unsavedModelDialog {
        .v-toolbar {
            background: transparent;
        }

        .v-card {
            padding: 0.5em;
            min-width: 30em;
        }

        .v-card-text {
            padding: 1em 1.5em;
        }

        .v-card-actions {
            display: flex;
            padding: 0 1em 1em 1em;
            justify-content: space-between !important;
        }
    }
</style>
