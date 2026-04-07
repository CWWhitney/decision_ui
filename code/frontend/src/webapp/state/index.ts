import { useEditorStore } from "./editor";
import { useComputationStore } from "./computation";
import { useGraphStore } from "./graph";
import { useMetadataStore } from "./metadata";
import { useRStore } from "./r";
import { useSaveModelDialogStore } from "./save_model_dialog";
import { useOpenModelDialogStore } from "./open_model";
import { useAiSupportDialogStore } from "./ai_support";
import { useErrorDialogStore } from "./error_dialog";
import { useNodeEditDialogStore } from "./node_edit";

export const resetState = () => {
    const graph = useGraphStore();
    const editor = useEditorStore();
    const computation = useComputationStore();
    const metadata = useMetadataStore();
    const rcode = useRStore();
    const aiSupportDialog = useAiSupportDialogStore();
    const openModelDialog = useOpenModelDialogStore();
    const saveModelDialog = useSaveModelDialogStore();
    const nodeEditDialog = useNodeEditDialogStore();
    const errorDialog = useErrorDialogStore();

    graph.reset();
    editor.reset();
    computation.reset();
    metadata.reset();
    rcode.reset();
    aiSupportDialog.reset();
    openModelDialog.reset();
    saveModelDialog.reset();
    nodeEditDialog.reset();
    errorDialog.reset();
};
