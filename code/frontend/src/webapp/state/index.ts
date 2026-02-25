import { useEditorStore } from "./editor";
import { useComputationStore } from "./computation";
import { useGraphStore } from "./graph";
import { useMetadataStore } from "./metadata";
import { useRCodeStore } from "./rcode";

export const resetState = () => {
    const graph = useGraphStore();
    const editor = useEditorStore();
    const computation = useComputationStore();
    const metadata = useMetadataStore();
    const rcode = useRCodeStore();

    graph.reset();
    editor.reset();
    computation.reset();
    metadata.reset();
    rcode.reset();
};
