import { ref } from "vue";
import { useFlowGraphStore, type NodeState } from "../flow/graph";
import { defineStore } from "pinia";

const DIALOGS_NODE_EDIT_STORE_ID = "dialogs.nodeEdit";

export const useDialogsNodeEditStore = defineStore(DIALOGS_NODE_EDIT_STORE_ID, () => {
  const isOpen = ref(false);
  const node = ref<NodeState | null>(null);

  const reset = () => {
    isOpen.value = false;
    node.value = null;
  };

  const openDialog = (nodeId: string) => {
    const flowGraphStore = useFlowGraphStore();
    const nextNode = flowGraphStore.getNode(nodeId);
    if (nextNode.value) {
      isOpen.value = true;
      node.value = nextNode.value;
    }
  };

  const closeDialog = () => {
    isOpen.value = false;
    node.value = null;
  };

  return { isOpen, node, openDialog, closeDialog, reset };
});
