<script setup lang="ts">
    import {
        SAVE_MODEL_TO_ACCOUNT_TAB,
        SAVE_MODEL_TO_FILE_TAB,
        useSaveModelDialogStore
    } from "../../state/save_model_dialog";

    import { useAccountStore } from "../../state/account";
    import { useMetadataStore } from "../../state/metadata";
    import { useRouter } from "vue-router";

    const router = useRouter();
    const account = useAccountStore();
    const metadata = useMetadataStore();
    const saveModelDialog = useSaveModelDialogStore();

    const openHelpSection = () => {
        saveModelDialog.closeDialog();
        router.push("/help/user-interface/save-model-dialog");
    };
</script>

<template>
    <v-dialog
        v-model="saveModelDialog.isOpen"
        :width="'auto'"
        :height="'auto'"
        class="saveModelDialog"
        @click:outside="saveModelDialog.closeDialog()"
    >
        <v-card>
            <v-toolbar>
                <v-toolbar-title>Save Model</v-toolbar-title>
                <v-toolbar-items>
                    <v-tooltip location="bottom" text="go to help section" open-delay="500">
                        <template #activator="{ props }">
                            <v-btn v-bind="props" icon="mdi-help-circle-outline" @click="openHelpSection" />
                        </template>
                    </v-tooltip>
                    <v-btn icon="mdi-close" @click="saveModelDialog.closeDialog()"></v-btn>
                </v-toolbar-items>
            </v-toolbar>

            <v-card-text class="tabCard">
                <v-tabs v-model="saveModelDialog.tab" color="primary" direction="vertical">
                    <v-tab
                        prepend-icon="mdi-account-circle"
                        text="To Account"
                        :value="SAVE_MODEL_TO_ACCOUNT_TAB"
                        :disabled="!account.isLoggedIn"
                    ></v-tab>
                    <v-tab prepend-icon="mdi-file-outline" text="To File" :value="SAVE_MODEL_TO_FILE_TAB"></v-tab>
                </v-tabs>
                <v-tabs-window v-model="saveModelDialog.tab">
                    <v-tabs-window-item :value="SAVE_MODEL_TO_ACCOUNT_TAB">
                        <p>Save this model as a new model to your account:</p>
                        <div class="centeredButtonContainer">
                            <v-text-field v-model="metadata.state.name" label="Model Name" hide-details />
                            <v-btn
                                text="Save as New"
                                color="primary"
                                variant="outlined"
                                @click="saveModelDialog.saveAsNew"
                            ></v-btn>
                        </div>
                    </v-tabs-window-item>
                    <v-tabs-window-item :value="SAVE_MODEL_TO_FILE_TAB">
                        <p>Save this model as a file:</p>
                        <div class="centeredButtonContainer">
                            <v-text-field v-model="metadata.state.name" label="Model Name" hide-details />
                            <v-btn
                                text="Download File"
                                color="primary"
                                variant="outlined"
                                @click="saveModelDialog.downloadModel"
                            ></v-btn>
                        </div>
                    </v-tabs-window-item>
                </v-tabs-window>
            </v-card-text>

            <v-card-actions>
                <v-btn color="grey" variant="text" @click="saveModelDialog.closeDialog()">cancel</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<style lang="scss" scoped>
    .saveModelDialog {
        .v-toolbar {
            background: transparent;
        }

        .v-card {
            padding: 0.5em;
        }

        .v-card-text {
            overflow: hidden;
        }

        .tabCard {
            display: flex;
            gap: 2em;
            justify-content: stretch;
            align-items: stretch;
        }

        :deep(.v-window) {
            width: 100%;
            min-width: 35em;
            min-height: 15em;
            overflow: auto;
        }

        :deep(.v-window__container) {
            min-height: 100%;
        }

        :deep(.v-window-item) {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
        }
    }

    .centeredButtonContainer {
        margin-top: 1em;
        display: flex;
        flex-direction: column;
        gap: 0.5em;
        width: 100%;
        height: 100%;
        justify-content: center;
        align-items: end;

        :deep(.v-input) {
            width: 100%;
        }
    }
</style>
