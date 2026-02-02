import {
    type ComputationSettings,
    type EditorSettings,
    type ModelFile,
    type Graph,
    type ModelMetadata,
    ModelFileSchema,
    validateJson
} from "@decision-support-ui/common";

import { useFlowGraphStore } from "./graph";
import { useEditorSettingsStore } from "./settings";
import { useComputationSettingsStore } from "./settings";
import { useMetadataStore } from "./metadata";

const getGraphState = (): Graph => {
    const graph = useFlowGraphStore();

    return {
        nodes: graph.nodes,
        edges: graph.edges
    };
};

const getEditorSettingsState = (): EditorSettings => {
    const editorSettings = useEditorSettingsStore();

    return {
        background: editorSettings.background,
        edgeStyle: editorSettings.edgeStyle,
        locked: editorSettings.locked,
        snapToGrid: editorSettings.snapToGrid
    };
};

const getMetadataState = (): ModelMetadata => {
    const metadata = useMetadataStore();

    return {
        name: metadata.name,
        description: metadata.description,
        creationDate: metadata.creationDate,
        lastModified: metadata.lastModified
    };
};

const getComputationSettingsState = (): ComputationSettings => {
    const computationSettings = useComputationSettingsStore();

    return {
        mcRuns: computationSettings.mcRuns,
        histogramBins: computationSettings.histogramBins
    };
};

export const getModelFileFromState = (): ModelFile => {
    return {
        _schema: {
            name: "de.uni-bonn.decision-model/file",
            version: 1
        },
        graph: getGraphState(),
        metadata: getMetadataState(),
        settings: {
            editor: getEditorSettingsState(),
            computation: getComputationSettingsState()
        }
    };
};

export const loadModelFileToState = (state: ModelFile): void => {
    const graph = useFlowGraphStore();
    const editorSettings = useEditorSettingsStore();
    const computationSettings = useComputationSettingsStore();
    const metadata = useMetadataStore();

    graph.$patch(state.graph);
    editorSettings.$patch(state.settings.editor);
    computationSettings.$patch(state.settings.computation);
    metadata.$patch(state.metadata);
};

export const downloadModelFile = () => {
    const state = getModelFileFromState();
    const date = new Date().toISOString().split("T")[0];
    const filename = `${date}_${state.metadata.name.replace(/\s/, "_")}.json`;
    downloadJson(state, filename);
};

export const uploadModelFile = async () => {
    const text = await uploadFile();
    const state = JSON.parse(text) as ModelFile;
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
