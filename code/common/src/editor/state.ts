import { SubgraphId } from "../graph";
import { EditorFileState } from "../io";

export interface EditorStoreState extends EditorFileState {
    subgraphId: SubgraphId | null;
    shouldFitOnNextUpdate: boolean;
}
