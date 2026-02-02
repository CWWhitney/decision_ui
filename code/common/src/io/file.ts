import { ComputationSettings } from "../compute";
import { EditorSettings } from "../editor";
import { Graph } from "../graph";
import { ModelMetadata } from "../metadata";

export interface ModelFile {
    _schema: {
        name: "de.uni-bonn.decision-model/file";
        version: 1;
    };
    metadata: ModelMetadata;
    graph: Graph;
    settings: {
        editor: EditorSettings;
        computation: ComputationSettings;
    };
}
