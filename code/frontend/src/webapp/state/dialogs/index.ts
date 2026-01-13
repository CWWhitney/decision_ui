import { useDialogsNodeEditStore } from "./nodeEdit";

export const useDialogsStore = () => {
  const nodeEdit = useDialogsNodeEditStore();

  const reset = () => {
    nodeEdit.reset();
  };

  return {
    nodeEdit,
    reset
  };
};
