import * as common from "@decision-support-ui/common";

import { ref } from "vue";
import { defineStore } from "pinia";
import { loadModelFileToState, uploadFile } from "./io";
import { useErrorDialogStore } from "./error_dialog";

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
    const errorDialog = useErrorDialogStore();
    const validateModelFile = common.validateSchema(common.ModelFileSchema);

    const isOpen = ref(false);
    const tab = ref<AvailableOpenModelTabs>(OPEN_MODEL_FROM_FILE_TAB);

    const reset = () => {
        isOpen.value = false;
        tab.value = OPEN_MODEL_FROM_FILE_TAB;
    };

    const openDialog = (currentTab?: AvailableOpenModelTabs) => {
        isOpen.value = true;
        tab.value = currentTab ?? OPEN_MODEL_FROM_FILE_TAB;
    };

    const closeDialog = () => {
        isOpen.value = false;
    };

    const uploadAndLoadModelFile = async () => {
        try {
            const text = await uploadFile();
            const state = JSON.parse(text) as common.ModelFileState;
            const validationError = validateModelFile(state);
            if (validationError) {
                throw new Error(validationError);
            }
            loadModelFileToState(state);
        } catch (e) {
            errorDialog.openDialog(
                "Invalid Model File",
                `Your uploaded model file seems to be corrupt or outdated.`,
                (e as Error).message ?? undefined
            );
        }
        closeDialog();
    };

    return { isOpen, tab, openDialog, closeDialog, reset, uploadAndLoadModelFile };
});
