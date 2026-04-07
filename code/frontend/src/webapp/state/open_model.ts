import * as common from "@decision-support-ui/common";
import { ref, watch } from "vue";
import { defineStore } from "pinia";

import { downloadModelFile, loadModelFileToState, uploadFile } from "./io";
import { useErrorDialogStore } from "./error_dialog";
import { useAccountStore } from "./account";
import { generateDeleteModelRequest, generateGetModelRequest, generateListModelsRequest } from "../rest/models";
import { useSaveModelDialogStore } from "./save_model_dialog";

export const OPEN_MODEL_FROM_ACCOUNT_TAB = "account";
export const OPEN_MODEL_FROM_FILE_TAB = "file";
export const OPEN_MODEL_FROM_EXAMPLE_TAB = "example";

export type OpenModelFromAccountTab = "account";
export type OpenModelFromFileTab = "file";
export type OpenModelFromExampleTab = "example";

export type AvailableOpenModelTabs = OpenModelFromAccountTab | OpenModelFromFileTab | OpenModelFromExampleTab;

export const AVAILABLE_OPEN_MODEL_TABS = [
    OPEN_MODEL_FROM_ACCOUNT_TAB,
    OPEN_MODEL_FROM_FILE_TAB,
    OPEN_MODEL_FROM_EXAMPLE_TAB
];

const OPEN_MODEL_DIALOG_STORE_ID = "openModelDialog";

export const useOpenModelDialogStore = defineStore(OPEN_MODEL_DIALOG_STORE_ID, () => {
    const account = useAccountStore();
    const errorDialog = useErrorDialogStore();
    const saveModelDialog = useSaveModelDialogStore();
    const validateModelFile = common.validateSchema(common.ModelFileSchema);
    const doListModelsRequest = generateListModelsRequest();
    const doGetModelRequest = generateGetModelRequest();
    const doDeleteModelRequest = generateDeleteModelRequest();

    const isOpen = ref(false);
    const tab = ref<AvailableOpenModelTabs>(OPEN_MODEL_FROM_FILE_TAB);
    const userModelList = ref<common.ListModelsEntry[]>([]);
    const deleteConfirmModelId = ref<number | null>(null);

    const reset = () => {
        isOpen.value = false;
        tab.value = OPEN_MODEL_FROM_FILE_TAB;
        deleteConfirmModelId.value = null;
    };

    const openDialog = (currentTab?: AvailableOpenModelTabs) => {
        isOpen.value = true;
        tab.value = currentTab ?? (account.isLoggedIn ? OPEN_MODEL_FROM_ACCOUNT_TAB : OPEN_MODEL_FROM_FILE_TAB);
        deleteConfirmModelId.value = null;
        loadUserModelList();
    };

    const closeDialog = () => {
        isOpen.value = false;
    };

    const uploadAndLoadModelFile = async () => {
        try {
            const text = await uploadFile();
            const state = JSON.parse(text) as common.ModelFileState;
            const migratedState = common.migrateModelFile(state);
            const validationError = validateModelFile(migratedState);
            if (validationError) {
                throw new Error(validationError);
            }
            saveModelDialog.setModelId(null);
            loadModelFileToState(null, migratedState);
        } catch (e) {
            errorDialog.openDialog(
                "Invalid Model File",
                `Your uploaded model file seems to be corrupt or outdated.`,
                (e as Error).message ?? undefined
            );
        }
        closeDialog();
    };

    const loadUserModelList = async () => {
        const accessToken = account.transient.accessToken;
        if (accessToken) {
            doListModelsRequest({
                accessToken,
                onSuccess: models => {
                    userModelList.value = models;
                    deleteConfirmModelId.value = null;
                },
                onError: message => {
                    errorDialog.openDialog(
                        `Retrieving Models Failed`,
                        `There was a technical error while retrieving the list of models from your account. ` +
                            `Please report this as a bug.`,
                        message
                    );
                }
            });
        }
    };

    const openUserModel = async (modelId: number) => {
        const accessToken = account.transient.accessToken;
        if (accessToken) {
            doGetModelRequest({
                accessToken,
                modelId,
                onSuccess: (modelId: number, modelfile: common.ModelFileState) => {
                    loadModelFileToState(modelId, modelfile);
                    closeDialog();
                },
                onError: (message: string) => {
                    errorDialog.openDialog(
                        `Retrieving Model Failed`,
                        `There was a technical error while retrieving your model from your account. ` +
                            `Please report this as a bug.`,
                        message
                    );
                }
            });
        }
    };

    const downloadUserModel = async (modelId: number) => {
        const accessToken = account.transient.accessToken;
        if (accessToken) {
            doGetModelRequest({
                accessToken,
                modelId,
                onSuccess: (modelId: number, modelfile: common.ModelFileState) => {
                    downloadModelFile(modelfile);
                },
                onError: (message: string) => {
                    errorDialog.openDialog(
                        `Retrieving Model Failed`,
                        `There was a technical error while retrieving your model from your account. ` +
                            `Please report this as a bug.`,
                        message
                    );
                }
            });
        }
    };

    const deleteUserModel = async (modelId: number) => {
        const accessToken = account.transient.accessToken;
        if (accessToken) {
            doDeleteModelRequest({
                accessToken,
                modelId,
                onSuccess: () => {
                    loadUserModelList();
                },
                onError: (message: string) => {
                    errorDialog.openDialog(
                        `Deleting Model Failed`,
                        `There was a technical error while deleting your model from your account. ` +
                            `Please report this as a bug.`,
                        message
                    );
                }
            });
        }
    };

    const onModelListDeleteClick = (modelId: number) => {
        if (deleteConfirmModelId.value == modelId) {
            deleteUserModel(modelId);
            deleteConfirmModelId.value = null;
        } else {
            deleteConfirmModelId.value = modelId;
        }
    };

    watch(
        () => account.isLoggedIn,
        () => {
            if (account.isLoggedIn) {
                loadUserModelList();
            }
        }
    );

    return {
        isOpen,
        tab,
        userModelList,
        deleteConfirmModelId,
        openDialog,
        closeDialog,
        reset,
        uploadAndLoadModelFile,
        loadUserModelList,
        openUserModel,
        downloadUserModel,
        deleteUserModel,
        onModelListDeleteClick
    };
});
