import { useFlowStore } from "./flow";
import { useDialogsStore } from "./dialogs";

export const useStore = () => {
  const flow = useFlowStore();
  const dialogs = useDialogsStore();

  const reset = () => {
    flow.reset();
    dialogs.reset();
  };

  return { flow, dialogs, reset };
};
