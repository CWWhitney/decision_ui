import { useComputationSettingsStore } from "./computation/settings";
import { useEditorSettingsStore } from "./editor/settings";
import { useFlowGraphStore } from "./flow/graph";
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
