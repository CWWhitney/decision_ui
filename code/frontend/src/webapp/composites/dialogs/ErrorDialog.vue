<script lang="ts" setup>
    import { useErrorDialogStore } from "../../state/error_dialog";

    const errorDialog = useErrorDialogStore();
</script>

<template>
    <v-dialog
        v-model="errorDialog.isOpen"
        :width="'auto'"
        :height="'auto'"
        class="errorDialog"
        @click:outside="errorDialog.closeDialog()"
    >
        <v-card>
            <v-toolbar>
                <v-toolbar-title>
                    <span>Error: {{ errorDialog.title }}</span>
                </v-toolbar-title>
                <v-toolbar-items>
                    <v-btn icon="mdi-close" @click="errorDialog.closeDialog()"></v-btn>
                </v-toolbar-items>
            </v-toolbar>
            <v-card-text>
                <p>{{ errorDialog.message }}</p>
                <h4 v-if="errorDialog.details">Details</h4>
                <pre v-if="errorDialog.details">{{ errorDialog.details }}</pre>
            </v-card-text>
            <v-card-actions>
                <v-btn color="primary" @click="errorDialog.closeDialog()">Got It</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<style lang="scss" scoped>
    .errorDialog {
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
            padding: 0 1em 1em 1em;
        }

        h4 {
            margin: 1em 0;
        }

        pre {
            padding: 0.5em;
            border: 1px solid #eee;
            background: rgb(250, 250, 250);
            overflow: auto;
        }
    }
</style>
