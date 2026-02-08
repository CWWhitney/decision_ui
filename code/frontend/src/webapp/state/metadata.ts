import { useSessionStorage } from "@vueuse/core";
import { defineStore } from "pinia";
import { useGraphStore } from "./graph";

import * as common from "@decision-support-ui/common";

export const FLOW_METADATA_STORE_ID = "metadata";

const DEFAULT_MODEL_NAME = "New Model";

const getDefaultMetadataState = (): common.MetadataFileState => {
    return {
        name: DEFAULT_MODEL_NAME,
        description: "",
        creationDate: `${new Date().toUTCString()}`,
        lastModified: `${new Date().toUTCString()}`
    };
};

export const useMetadataStore = defineStore(FLOW_METADATA_STORE_ID, () => {
    const graphStore = useGraphStore();

    // --- persisted state
    const state = useSessionStorage(FLOW_METADATA_STORE_ID, getDefaultMetadataState());

    const reset = () => {
        state.value = getDefaultMetadataState();
    };

    // side effects

    graphStore.$subscribe(() => {
        state.value.lastModified = `${new Date().toUTCString()}`;
    });

    return { state, reset };
});
