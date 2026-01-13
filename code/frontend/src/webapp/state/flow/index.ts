import { reactive } from "vue";
import { useFlowGraphStore } from "./graph";
import { useFlowStyleStore } from "./style";
import { useFlowOptionsStore } from "./options";

export const useFlowStore = () => {
  const graph = useFlowGraphStore();
  const style = useFlowStyleStore();
  const options = useFlowOptionsStore();

  const reset = () => {
    graph.reset();
    style.reset();
    options.reset();
  };

  return reactive({
    graph,
    style,
    options,
    reset
  });
};
