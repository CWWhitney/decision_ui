import { ref } from "vue";
import { defineStore } from "pinia";
import { generateAddModelRequest, generateUpdateModelRequest } from "@/rest/models";
import { useAccountStore } from "./account";
import { downloadModelFile, getModelFileFromState } from "./io";
import { useErrorDialogStore } from "./error_dialog";

export const SAVE_MODEL_TO_ACCOUNT_TAB = "account";
export const SAVE_MODEL_TO_FILE_TAB = "file";

export type SaveModelToAccountTab = "account";
export type SaveModelToFileTab = "file";

export type AvailableSaveModelTabs = SaveModelToAccountTab | SaveModelToFileTab;

export const AVAILABLE_SAVE_MODEL_TABS = [SAVE_MODEL_TO_ACCOUNT_TAB, SAVE_MODEL_TO_FILE_TAB];

const SAVE_MODEL_DIALOG_STORE_ID = "saveModelDialog";

export const useSaveModelDialogStore = defineStore(SAVE_MODEL_DIALOG_STORE_ID, () => {
    const account = useAccountStore();
    const errorDialog = useErrorDialogStore();
    const doAddModelRequest = generateAddModelRequest();
    const doUpdateModelRequest = generateUpdateModelRequest();

    const isOpen = ref(false);
    const tab = ref<AvailableSaveModelTabs>(SAVE_MODEL_TO_FILE_TAB);
    const modelId = ref<number | null>(null);

    const reset = () => {
        isOpen.value = false;
        tab.value = SAVE_MODEL_TO_FILE_TAB;
    };

    const openDialog = (currentTab?: AvailableSaveModelTabs) => {
        isOpen.value = true;
        tab.value = currentTab ?? (account.isLoggedIn ? SAVE_MODEL_TO_ACCOUNT_TAB : SAVE_MODEL_TO_FILE_TAB);
    };

    const closeDialog = () => {
        isOpen.value = false;
    };

    const setModelId = (newModelId: number | null) => {
        modelId.value = newModelId;
    };

    const saveCurrent = () => {
        const accessToken = account.transient.accessToken;
        if (modelId.value != null && accessToken) {
            doUpdateModelRequest({
                accessToken,
                modelId: modelId.value,
                modelfile: getModelFileFromState(),
                onSuccess: () => {
                    //
                },
                onError: (message: string) => {
                    errorDialog.openDialog(
                        `Saving Model Failed`,
                        `There was a technical issue while saving your model. Please report this as a bug.`,
                        message
                    );
                }
            });
        } else {
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

    return { isOpen, tab, openDialog, closeDialog, reset, saveAsNew, setModelId, downloadModel, saveCurrent };
});
