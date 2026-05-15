import { computed, ref, watch } from "vue";
import { defineStore } from "pinia";
import { type Schema } from "ajv";

import * as common from "@decision-support-ui/common";

import { generateAddModelRequest, generateUpdateModelRequest } from "../rest/models";
import { useAccountStore } from "./account";
import { downloadModelFile, getModelFileFromState, useValidatedSessionStorage } from "./io";
import { useErrorDialogStore } from "./error_dialog";
import { useEditorStore } from "./editor";
import { useSnackbarStore } from "./snackbar";

export const SAVE_MODEL_TO_ACCOUNT_TAB = "account";
export const SAVE_MODEL_TO_FILE_TAB = "file";

export type SaveModelToAccountTab = "account";
export type SaveModelToFileTab = "file";

export type AvailableSaveModelTabs = SaveModelToAccountTab | SaveModelToFileTab;

export const AVAILABLE_SAVE_MODEL_TABS = [SAVE_MODEL_TO_ACCOUNT_TAB, SAVE_MODEL_TO_FILE_TAB];

export const AUTOSAVE_INTERVAL = 300000; // 5 minutes

const SAVE_MODEL_DIALOG_STORE_ID = "saveModelDialog";

interface SaveModelDialogTransientState {
    isOpen: boolean;
    tab: AvailableSaveModelTabs;
    autosaveInterval: NodeJS.Timeout | null;
}

const getDefaultSaveModelDialogTransientState = (): SaveModelDialogTransientState => {
    return {
        isOpen: false,
        tab: SAVE_MODEL_TO_FILE_TAB,
        autosaveInterval: null
    };
};

interface SaveModelDialogPersistedState {
    modelId: number | null;
}

const SaveModelDialogPersistedSchema: Schema = {
    type: "object",
    properties: {
        modlId: { type: ["number", "null"] }
    },
    required: ["modelId"]
};

const getDefaultSaveModelDialogPersistedState = (): SaveModelDialogPersistedState => {
    return {
        modelId: null
    };
};

export const useSaveModelDialogStore = defineStore(SAVE_MODEL_DIALOG_STORE_ID, () => {
    const account = useAccountStore();
    const errorDialog = useErrorDialogStore();
    const editor = useEditorStore();
    const snackbar = useSnackbarStore();
    const doAddModelRequest = generateAddModelRequest();
    const doUpdateModelRequest = generateUpdateModelRequest();
    const validateSaveModelDialogPersistedState = common.validateSchema(SaveModelDialogPersistedSchema);

    // --- persisted state
    const transient = ref<SaveModelDialogTransientState>(getDefaultSaveModelDialogTransientState());
    const persisted = useValidatedSessionStorage(
        SAVE_MODEL_DIALOG_STORE_ID,
        getDefaultSaveModelDialogPersistedState(),
        validateSaveModelDialogPersistedState
    );

    const reset = () => {
        transient.value = getDefaultSaveModelDialogTransientState();
        persisted.value = getDefaultSaveModelDialogPersistedState();
    };

    const openDialog = (currentTab?: AvailableSaveModelTabs) => {
        transient.value.isOpen = true;
        transient.value.tab = currentTab ?? (account.isLoggedIn ? SAVE_MODEL_TO_ACCOUNT_TAB : SAVE_MODEL_TO_FILE_TAB);
    };

    const closeDialog = () => {
        transient.value.isOpen = false;
    };

    const setModelId = (newModelId: number | null) => {
        persisted.value.modelId = newModelId;
    };

    const saveCurrent = (fallbackToDialog = true) => {
        const accessToken = account.transient.accessToken;
        const modelId = persisted.value.modelId;
        if (modelId != null && accessToken) {
            doUpdateModelRequest({
                accessToken,
                modelId,
                modelfile: getModelFileFromState(),
                onSuccess: () => {
                    snackbar.addSuccessMessage("Model saved successfully!");
                },
                onError: (message: string) => {
                    errorDialog.openDialog(
                        `Saving Model Failed`,
                        `There was a technical issue while saving your model. Please report this as a bug.`,
                        message
                    );
                }
            });
        } else if (fallbackToDialog) {
            openDialog();
        }
    };

    const saveAsNew = () => {
        const accessToken = account.transient.accessToken;
        if (accessToken) {
            doAddModelRequest({
                accessToken,
                modelfile: getModelFileFromState(),
                onSuccess(newModelId) {
                    snackbar.addSuccessMessage("Model saved successfully!");
                    setModelId(newModelId);
                    closeDialog();
                },
                onMaxModelsReached: () => {
                    errorDialog.openDialog(
                        `Maximum Number of Models Reached`,
                        `You have reached the maximum number of models that can be stored in your account. ` +
                            `Please delete some models before saving new ones.`
                    );
                },
                onError: (message: string) => {
                    errorDialog.openDialog(
                        `Saving Model Failed`,
                        `There was a technical issue while saving your model. Please report this as a bug.`,
                        message
                    );
                }
            });
        }
    };

    const downloadModel = () => {
        downloadModelFile(getModelFileFromState());
    };

    const canSaveCurrent = computed(() => persisted.value.modelId !== null);

    const isAutosaveAvailable = computed(() => account.isLoggedIn && canSaveCurrent.value);

    watch(
        () => isAutosaveAvailable.value && editor.persisted.autosave,
        active => {
            if (!active && transient.value.autosaveInterval) {
                // stop autosave interval (becaues it is not needed at the moment)
                clearInterval(transient.value.autosaveInterval);
                transient.value.autosaveInterval = null;
            } else if (active && transient.value.autosaveInterval == null) {
                // start autosave interval
                transient.value.autosaveInterval = setInterval(() => {
                    saveCurrent(false);
                }, AUTOSAVE_INTERVAL);
            }
        }
    );

    // reset model id if logged out
    watch(
        () => account.isLoggedIn,
        loggedIn => {
            if (!loggedIn) {
                persisted.value.modelId = null;
            }
        }
    );

    return {
        transient,
        persisted,
        openDialog,
        closeDialog,
        reset,
        saveAsNew,
        setModelId,
        downloadModel,
        saveCurrent,
        canSaveCurrent,
        isAutosaveAvailable
    };
});
