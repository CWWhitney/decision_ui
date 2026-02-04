import { ref } from "vue";
import { defineStore } from "pinia";
import type { NodeId } from "@decision-support-ui/common";

export const NODE_EDIT_GENERAL_TAB = "general";
export const NODE_EDIT_FUNCTION_TAB = "function";
export const NODE_EDIT_DATA_TAB = "data";
export const NODE_EDIT_STYLE_TAB = "style";
export const NODE_EDIT_DEBUG_TAB = "debug";

export type NodeEditGeneralTab = "general";
export type NodeEditFunctionTab = "function";
export type NodeEditDataTab = "data";
export type NodeEditStyleTab = "style";
export type NodeEditDebugTab = "debug";

export type AvailableNodeEditTabs =
    | NodeEditGeneralTab
    | NodeEditFunctionTab
    | NodeEditDataTab
    | NodeEditStyleTab
    | NodeEditDebugTab;

export const AVAILABLE_NODE_EDIT_TABS = [
    NODE_EDIT_GENERAL_TAB,
    NODE_EDIT_FUNCTION_TAB,
    NODE_EDIT_DATA_TAB,
    NODE_EDIT_STYLE_TAB,
    NODE_EDIT_DEBUG_TAB
];

const DIALOGS_NODE_EDIT_STORE_ID = "dialogs.nodeEdit";

export const useDialogsNodeEditStore = defineStore(DIALOGS_NODE_EDIT_STORE_ID, () => {
    const isOpen = ref(false);
    const nodeId = ref<NodeId | null>(null);
    const tab = ref<AvailableNodeEditTabs>(NODE_EDIT_GENERAL_TAB);

    const reset = () => {
        isOpen.value = false;
        nodeId.value = null;
        tab.value = NODE_EDIT_GENERAL_TAB;
    };

    const openDialog = (newNodeId: NodeId, currentTab?: AvailableNodeEditTabs) => {
        isOpen.value = true;
        nodeId.value = newNodeId;
        tab.value = currentTab ?? NODE_EDIT_GENERAL_TAB;
    };

    const closeDialog = () => {
        isOpen.value = false;
        nodeId.value = null;
    };

    return { isOpen, nodeId, tab, openDialog, closeDialog, reset };
});
