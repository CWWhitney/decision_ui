import { defineStore } from "pinia";
import { ref } from "vue";

export const FLOW_METADATA_STORE_ID = "metadata";

const DEFAULT_MODEL_NAME = "New Model";

export const useMetadataStore = defineStore(FLOW_METADATA_STORE_ID, () => {
    const name = ref<string>(DEFAULT_MODEL_NAME);
    const description = ref<string>("");
    const creationDate = ref<string>(`${new Date().toUTCString()}`);
    const lastModified = ref<string>(`${new Date().toUTCString()}`);

    const reset = () => {
        name.value = DEFAULT_MODEL_NAME;
        description.value = "";
        creationDate.value = `${new Date().toUTCString()}`;
        lastModified.value = `${new Date().toUTCString()}`;
    };

    return { name, description, creationDate, lastModified, reset };
});
