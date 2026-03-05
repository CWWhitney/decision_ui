<script setup lang="ts">
    import { loadModelFileToState } from "@/state/io";
    import {
        OPEN_MODEL_FROM_ACCOUNT_TAB,
        OPEN_MODEL_FROM_EXAMPLE_TAB,
        OPEN_MODEL_FROM_FILE_TAB,
        useOpenModelDialogStore
    } from "@/state/open_model";

    import * as common from "@decision-support-ui/common";

    import { useAccountStore } from "@/state/account";

    const account = useAccountStore();
    const openModelDialog = useOpenModelDialogStore();

    const getPrettyDate = (date: string) => {
        return new Intl.DateTimeFormat("default", {
            dateStyle: "long"
        }).format(new Date(date));
    };

    const getPrettyTime = (date: string) => {
        return new Intl.DateTimeFormat("default", {
            timeStyle: "short"
        }).format(new Date(date));
    };

    const EXAMPLE_MODEL_FILES: common.ModelFileState[] = [
        common.getAppleAgroforestExampleModelFile(),
        common.getWildfireExampleModelFile()
    ];

    const onExampleModelClick = (file: common.ModelFileState) => {
        loadModelFileToState(null, file);
        openModelDialog.closeDialog();
    };
</script>

<template>
    <v-dialog
        v-model="openModelDialog.isOpen"
        :width="'auto'"
        :height="'auto'"
        class="openModelDialog"
        @click:outside="openModelDialog.closeDialog()"
    >
        <v-card>
            <v-toolbar>
                <v-toolbar-title>Open Existing Model</v-toolbar-title>
                <v-toolbar-items>
                    <v-btn icon="mdi-close" @click="openModelDialog.closeDialog()"></v-btn>
                </v-toolbar-items>
            </v-toolbar>

            <v-card-text class="tabCard">
                <v-tabs v-model="openModelDialog.tab" color="primary" direction="vertical">
                    <v-tab
                        prepend-icon="mdi-account-circle"
                        text="From Account"
                        :value="OPEN_MODEL_FROM_ACCOUNT_TAB"
                        :disabled="!account.isLoggedIn"
                    ></v-tab>
                    <v-tab prepend-icon="mdi-file-outline" text="From File" :value="OPEN_MODEL_FROM_FILE_TAB"></v-tab>
                    <v-tab
                        prepend-icon="mdi-lightbulb-outline"
                        text="From Example"
                        :value="OPEN_MODEL_FROM_EXAMPLE_TAB"
                    ></v-tab>
                </v-tabs>
                <v-tabs-window v-model="openModelDialog.tab">
                    <v-tabs-window-item :value="OPEN_MODEL_FROM_ACCOUNT_TAB">
                        <p>Open an existing model from your account:</p>
                        <v-list class="modelList" lines="two">
                            <v-list-item
                                v-for="item in openModelDialog.userModelList"
                                :key="item.id"
                                lines="one"
                                @click="openModelDialog.openUserModel(item.id)"
                            >
                                <template #prepend>
                                    <v-avatar>
                                        <v-icon class="grey-lighten-1"> mdi-file-outline </v-icon>
                                    </v-avatar>
                                </template>
                                <template #title>
                                    {{ item.name }}
                                </template>
                                <template #subtitle>
                                    {{ item.description }}
                                </template>
                                <template #append>
                                    <span class="date">
                                        <span class="time">{{ getPrettyTime(item.updatedAt) }}</span>
                                        <span class="day">{{ getPrettyDate(item.updatedAt) }}</span>
                                    </span>
                                    <v-tooltip location="bottom" text="download model as file" open-delay="500">
                                        <template #activator="{ props }">
                                            <v-btn
                                                v-bind="props"
                                                icon="mdi-download-outline"
                                                variant="outlined"
                                                size="small"
                                                @click.stop="openModelDialog.downloadUserModel(item.id)"
                                            />
                                        </template>
                                    </v-tooltip>
                                    <v-tooltip
                                        location="bottom"
                                        :text="
                                            openModelDialog.deleteConfirmModelId == item.id
                                                ? 'really delete?'
                                                : 'delete model from account'
                                        "
                                        open-delay="500"
                                    >
                                        <template #activator="{ props }">
                                            <v-btn
                                                v-bind="props"
                                                :icon="
                                                    openModelDialog.deleteConfirmModelId == item.id
                                                        ? 'mdi-check'
                                                        : 'mdi-trash-can-outline'
                                                "
                                                :color="
                                                    openModelDialog.deleteConfirmModelId == item.id
                                                        ? 'error'
                                                        : undefined
                                                "
                                                variant="outlined"
                                                size="small"
                                                @click.stop="openModelDialog.onModelListDeleteClick(item.id)"
                                            />
                                        </template>
                                    </v-tooltip>
                                </template>
                            </v-list-item>
                        </v-list>
                    </v-tabs-window-item>
                    <v-tabs-window-item :value="OPEN_MODEL_FROM_FILE_TAB">
                        <p>Open an existing model from a previously saved file:</p>
                        <div class="uploadFileContainer">
                            <v-btn
                                text="Upload a File"
                                color="primary"
                                variant="outlined"
                                @click="openModelDialog.uploadAndLoadModelFile"
                            ></v-btn>
                        </div>
                    </v-tabs-window-item>
                    <v-tabs-window-item :value="OPEN_MODEL_FROM_EXAMPLE_TAB">
                        <p>Open one of the example models:</p>
                        <v-list class="modelList" lines="two">
                            <v-list-item
                                v-for="(file, i) in EXAMPLE_MODEL_FILES"
                                :key="i"
                                :title="file.metadata.name"
                                :subtitle="file.metadata.description"
                                lines="one"
                                @click="onExampleModelClick(file)"
                            >
                                <template #prepend>
                                    <v-avatar>
                                        <v-icon class="grey-lighten-1"> mdi-lightbulb-outline </v-icon>
                                    </v-avatar>
                                </template>
                            </v-list-item>
                        </v-list>
                    </v-tabs-window-item>
                </v-tabs-window>
            </v-card-text>

            <v-card-actions>
                <v-btn color="grey" variant="text" @click="openModelDialog.closeDialog()">cancel</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<style lang="scss" scoped>
    .openModelDialog {
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

    .uploadFileContainer {
        flex-grow: 1;
        display: flex;
        width: 100%;
        height: 100%;
        justify-content: center;
        align-items: center;
    }

    .modelList {
        max-width: 60em;
        overflow: auto;

        :deep(.date) {
            font-size: 0.875rem;
            font-weight: 400;
            opacity: var(--v-medium-emphasis-opacity);
            display: flex;
            flex-direction: column;
            align-items: center;
            margin: 0 0.5em;
        }

        :deep(.v-list-item) {
            padding: 1em;
        }

        :deep(.v-list-item__append) {
            display: flex;
            gap: 0.5em;
        }
    }
</style>
