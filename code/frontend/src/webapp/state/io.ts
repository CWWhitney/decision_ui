import * as common from "@decision-support-ui/common";

import { useGraphStore } from "./graph";
import { useEditorStore } from "./editor";
import { useComputationStore } from "./computation";
import { useMetadataStore } from "./metadata";
import { useSessionStorage } from "@vueuse/core";
import { useSaveModelDialogStore } from "./save_model_dialog";

export const getModelFileFromState = (): common.ModelFileState => {
    const graph = useGraphStore();
    const metadata = useMetadataStore();
    const computation = useComputationStore();
    const editor = useEditorStore();

    return {
        _schema: {
            name: common.MODEL_FILE_SCHEMA_NAME,
            version: common.MODEL_FILE_VERSION
        },
        graph: { ...graph.state },
        metadata: { ...metadata.state },
        computation: { ...computation.persisted },
        editor: { ...editor.persisted }
    };
};

export const getGraphFileFromState = (selectedNodeIds: common.NodeId[]): common.GraphFileState => {
    const graph = useGraphStore();
    const editor = useEditorStore();
    const rootSubgraphId = editor.transient.subgraphId;
    const anyDescendantsNodeIds = selectedNodeIds.reduce(
        (p, nodeId) => [...p, ...graph.getComputedAnyDescendants(nodeId).map(n => n.id)],
        [] as common.NodeId[]
    );
    const selectedNodeIdSet = new Set([...selectedNodeIds, ...anyDescendantsNodeIds]);

    return {
        _schema: {
            name: common.GRAPH_FILE_SCHEMA_NAME,
            version: common.GRAPH_FILE_VERSION
        },
        graph: {
            nodes: graph.state.nodes
                .filter(n => selectedNodeIdSet.has(n.id))
                .map(node => ({
                    ...node,
                    subgraphParentId: node.subgraphParentId == rootSubgraphId ? null : node.subgraphParentId
                })),
            edges: graph.state.edges.filter(e => selectedNodeIdSet.has(e.source) && selectedNodeIdSet.has(e.target))
        }
    };
};

export const saveGraphFileToClipboard = (selectedNodeIds: common.NodeId[]) => {
    if (selectedNodeIds.length == 0) {
        return;
    }
    const json = getGraphFileFromState(selectedNodeIds);
    navigator.clipboard.writeText(JSON.stringify(json, null, 2));
};

export const generateInsertGraphFromClipboard = () => {
    const validateGraph = common.validateSchema(common.GraphFileSchema);
    return async (targetPosition: common.Position, targetSubgraphId: common.SubgraphId | null) => {
        const jsonText = await navigator.clipboard.readText();
        const graphFile = JSON.parse(jsonText) as common.GraphFileState;
        const error = validateGraph(graphFile);
        if (!error) {
            insertGraphFileToState(graphFile, targetPosition, targetSubgraphId);
        } else {
            console.error(`validation error ${error}`);
        }
    };
};

export const insertGraphFileToState = (
    file: common.GraphFileState,
    targetPosition: common.Position,
    targetSubgraphId: common.SubgraphId | null
): void => {
    const graph = useGraphStore();
    const nextNodeId = common.getNextNodeId(graph.state.nodes);
    const centerPosition = common.getCenterPosition(
        file.graph.nodes.filter(n => n.nodeParentId == null && n.subgraphParentId == null).map(common.getNodeCenter)
    );
    const newGraph = common.moveGraph(common.makeDistinctNodeIdsInGraph(file.graph, nextNodeId, targetSubgraphId), {
        x: targetPosition.x - centerPosition.x,
        y: targetPosition.y - centerPosition.y
    });

    graph.$patch({
        state: {
            nodes: [...graph.state.nodes, ...newGraph.nodes],
            edges: [...graph.state.edges, ...newGraph.edges]
        }
    });
};

export const loadModelFileToState = (modelId: number | null, file: common.ModelFileState): void => {
    const graph = useGraphStore();
    const editor = useEditorStore();
    const computation = useComputationStore();
    const metadata = useMetadataStore();
    const saveModelDialog = useSaveModelDialogStore();

    saveModelDialog.setModelId(modelId);

    editor.reset();
    editor.loadFromFile(file.editor);

    graph.reset();
    graph.$patch({ state: file.graph });
    graph.history.commit();
    graph.history.clear();

    computation.reset();
    computation.$patch({ persisted: file.computation });

    metadata.reset();
    metadata.$patch({ state: file.metadata });
};

export const downloadModelFile = (state: common.ModelFileState) => {
    const date = new Date().toISOString().split("T")[0];
    const filename = `${date}_${state.metadata.name.replace(/\s/g, "_")}.json`;
    downloadJson(state, filename);
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

export const useValidatedSessionStorage = <T>(
    key: string,
    fallbackState: T,
    validate: (state: T) => string | false
) => {
    return useSessionStorage(key, fallbackState, {
        serializer: {
            read: (raw: string) => {
                const json = JSON.parse(raw);
                const error = validate(json);
                if (!error) {
                    return json as T;
                }
                console.error(`error validating state from session storage:\n\n${error}`);
                return fallbackState;
            },
            write: (state: T) => {
                return JSON.stringify(state);
            }
        }
    });
};
