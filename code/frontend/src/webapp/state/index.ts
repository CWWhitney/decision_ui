import { useEditorSettingsStore, useComputationSettingsStore } from "./settings";
import { useFlowGraphStore } from "./graph";
import { useMetadataStore } from "./metadata";

export const resetState = () => {
    const graph = useFlowGraphStore();
    const editorSettings = useEditorSettingsStore();
    const computationSettings = useComputationSettingsStore();
    const metadata = useMetadataStore();

    graph.reset();
    editorSettings.reset();
    computationSettings.reset();
    metadata.reset();
};
