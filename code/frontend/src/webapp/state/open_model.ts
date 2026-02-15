import { ref } from "vue";
import { defineStore } from "pinia";

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

    return { isOpen, tab, openDialog, closeDialog, reset };
});
