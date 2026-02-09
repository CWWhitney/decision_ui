import { type ModelFileState, ModelFileSchema, validateJson } from "@decision-support-ui/common";

import { useGraphStore } from "./graph";
import { useEditorStore } from "./editor";
import { useComputationStore } from "./computation";
import { useMetadataStore } from "./metadata";

export const getModelFileFromState = (): ModelFileState => {
    const graph = useGraphStore();
    const metadata = useMetadataStore();
    const computation = useComputationStore();
    const editor = useEditorStore();

    return {
        _schema: {
            name: "de.uni-bonn.decision-model/file",
            version: 1
        },
        graph: { ...graph.state },
        metadata: { ...metadata.state },
        computation: { ...computation.state },
        editor: { ...editor.state }
    };
};

export const loadModelFileToState = (file: ModelFileState): void => {
    const graph = useGraphStore();
    const editor = useEditorStore();
    const computation = useComputationStore();
    const metadata = useMetadataStore();

    graph.reset();
    graph.$patch({ state: file.graph });
    graph.history.commit();
    graph.history.clear();

    editor.loadFromFile(file.editor);

    computation.reset();
    computation.$patch({ state: file.computation });

    metadata.reset();
    metadata.$patch({ state: file.metadata });
};

export const downloadModelFile = () => {
    const state = getModelFileFromState();
    const date = new Date().toISOString().split("T")[0];
    const filename = `${date}_${state.metadata.name.replace(/\s/, "_")}.json`;
    downloadJson(state, filename);
};

export const uploadModelFile = async () => {
    const text = await uploadFile();
    const state = JSON.parse(text) as ModelFileState;
    const validationErrors = validateJson(state, ModelFileSchema);
    if (!validationErrors) {
        loadModelFileToState(state);
    } else {
        console.error("validation errors", validationErrors);
    }
};

export const downloadJson = (json: object, filename: string) => {
    const text = JSON.stringify(json, null, 2);
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
};

export const uploadFile = async (): Promise<string> => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    return new Promise<string>((resolve, reject) => {
        input.onchange = () => {
            const file = input.files?.[0];
            if (!file) {
                return reject(`no file selected`);
            }

            const reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result as string);
            };
            reader.readAsText(file);
        };

        input.click();
    });
};
