import { SubgraphId } from "../graph";
import { EditorFileState } from "../io";

export type EditorStorePersistedState = EditorFileState;

export interface EditorStoreTansientState {
    subgraphId: SubgraphId | null;
    shouldFitOnNextUpdate: boolean;
}
