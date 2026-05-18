import { ref } from "vue";
import { defineStore } from "pinia";
import { useGraphStore } from "./graph";
import { useMetadataStore } from "./metadata";
import { useEditorStore } from "./editor";
import { useComputationStore } from "./computation";
import { useSaveModelDialogStore } from "./save_model_dialog";

const UNSAVED_MODEL_DIALOG_STORE_ID = "unsavedModelDialog";

export const useUnsavedModelDialogStore = defineStore(UNSAVED_MODEL_DIALOG_STORE_ID, () => {
    const graph = useGraphStore();
    const metadata = useMetadataStore();
    const editor = useEditorStore();
    const computation = useComputationStore();
    const saveModelDialog = useSaveModelDialogStore();

    const isOpen = ref(false);
    const continueCallback = ref<null | (() => void)>(null);
    const modelIsUnsaved = ref(false);

    const markModelAsSaved = () => {
        modelIsUnsaved.value = false;
    };

    const reset = () => {
        isOpen.value = false;
        modelIsUnsaved.value = false;
        continueCallback.value = null;
    };

    const openDialog = (callback: () => void) => {
        if (modelIsUnsaved.value) {
            isOpen.value = true;
            continueCallback.value = callback;
        } else if (callback) {
            callback();
        }
    };

    const closeAndSave = () => {
        isOpen.value = false;
        saveModelDialog.saveCurrent();
        if (continueCallback.value) {
            continueCallback.value();
        }
    };

    const closeWithoutSaving = () => {
        isOpen.value = false;
        if (continueCallback.value) {
            continueCallback.value();
        }
    };

    const closeAndCancel = () => {
        isOpen.value = false;
    };

    graph.$subscribe(() => {
        modelIsUnsaved.value = true;
    });

    metadata.$subscribe(() => {
        modelIsUnsaved.value = true;
    });

    editor.$subscribe(() => {
        modelIsUnsaved.value = true;
    });

    computation.$subscribe(() => {
        modelIsUnsaved.value = true;
    });

    return {
        isOpen,
        modelIsUnsaved,
        openDialog,
        closeAndSave,
        closeWithoutSaving,
        closeAndCancel,
        reset,
        markModelAsSaved
    };
});
