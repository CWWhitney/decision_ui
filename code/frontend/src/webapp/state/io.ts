import * as common from "@decision-support-ui/common";

import { useGraphStore } from "./graph";
import { useEditorStore } from "./editor";
import { useComputationStore } from "./computation";
import { useMetadataStore } from "./metadata";

export const getModelFileFromState = (): common.ModelFileState => {
    const graph = useGraphStore();
    const metadata = useMetadataStore();
    const computation = useComputationStore();
    const editor = useEditorStore();

    return {
        _schema: {
            name: common.MODEL_FILE_SCHEMA_NAME,
            version: 1
        },
        graph: { ...graph.state },
        metadata: { ...metadata.state },
        computation: { ...computation.state },
        editor: { ...editor.state }
    };
};

export const getGraphFileFromState = (selectedNodeIds: common.NodeId[]): common.GraphFileState => {
    const graph = useGraphStore();
    const editor = useEditorStore();
    const rootSubgraphId = editor.state.subgraphId;
    const anyDescendantsNodeIds = selectedNodeIds.reduce(
        (p, nodeId) => [...p, ...graph.getComputedAnyDescendants(nodeId).map(n => n.id)],
        [] as common.NodeId[]
    );
    const selectedNodeIdSet = new Set([...selectedNodeIds, ...anyDescendantsNodeIds]);

    return {
        _schema: {
            name: common.GRAPH_FILE_SCHEMA_NAME,
            version: 1
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

export const insertGraphFromClipboard = async (
    targetPosition: common.Position,
    targetSubgraphId: common.SubgraphId | null
) => {
    const jsonText = await navigator.clipboard.readText();
    const graphFile = JSON.parse(jsonText) as common.GraphFileState;
    const validationErrors = common.validateJson(graphFile, common.GraphFileSchema);
    if (!validationErrors) {
        insertGraphFileToState(graphFile, targetPosition, targetSubgraphId);
    } else {
        console.error("validation errors", validationErrors);
    }
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

export const loadModelFileToState = (file: common.ModelFileState): void => {
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
    const state = JSON.parse(text) as common.ModelFileState;
    const validationErrors = common.validateJson(state, common.ModelFileSchema);
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
