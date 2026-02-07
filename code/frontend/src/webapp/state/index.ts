import { useEditorStore } from "./editor";
import { useComputationStore } from "./computation";
import { useGraphStore } from "./graph";
import { useMetadataStore } from "./metadata";

export const resetState = () => {
    const graph = useGraphStore();
    const editor = useEditorStore();
    const computation = useComputationStore();
    const metadata = useMetadataStore();

    graph.reset();
    editor.reset();
    computation.reset();
    metadata.reset();
};
