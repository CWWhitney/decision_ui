<script setup lang="ts">
  import { debounce } from "@/common/throttle";
  import { AVAILABLE_DISTRIBUTIONS } from "@/editor/distributions";
  import { useFlowGraphStore } from "@/state/flow/graph";
  import {
    ESTIMATE_NODE_TYPE,
    getExpressionError,
    OPERATION_NODE_TYPE,
    RESULT_NODE_TYPE,
    type Node
  } from "@decision-support-ui/common";
  import { computed, ref, watch } from "vue";

  const node = defineModel<Node>({ required: true });
  const graphStore = useFlowGraphStore();

  const operationNodeExpressionInputValue = ref<string | null>(
    node.value.type == OPERATION_NODE_TYPE ? node.value.options.expression : null
  );

  const estimateNodeLowerValue = computed(() => {
    if (node.value.type == ESTIMATE_NODE_TYPE) {
      return node.value.options.lower;
    }
    return null;
  });

  watch(estimateNodeLowerValue, value => {
    if (value && node.value.type == ESTIMATE_NODE_TYPE && node.value.options.distribution == "deterministic") {
      node.value.options.upper = value;
    }
  });

  const operationNodeExpression = computed(() => {
    if (node.value.type == OPERATION_NODE_TYPE) {
      return node.value.options.expression;
    }
    return null;
  });

  watch(operationNodeExpression, value => {
    operationNodeExpressionInputValue.value = value;
  });

  watch(
    operationNodeExpressionInputValue,
    debounce((value: string | null) => {
      if (node.value.type == OPERATION_NODE_TYPE && value) {
        graphStore.setEstimateNodeExpressionAction(node.value.id, value);
      }
    }, 300)
  );

  const operationNodeExpressionError = computed(() => {
    const expression = operationNodeExpression.value;
    if (expression) {
      return getExpressionError(expression);
    }
    return null;
  });

  const onResultVariableChange = (index: number, value: string) => {
    if (node.value.type == RESULT_NODE_TYPE) {
      if (index < node.value.options.variables.length) {
        if (value.trim() == "") {
          node.value.options.variables = node.value.options.variables.filter((_, i) => i != index);
        } else {
          node.value.options.variables[index] = value;
        }
      } else if (value.trim() !== "") {
        node.value.options.variables.push(value.trim());
      }
    }
  };
</script>

<template>
  <div v-if="node.type == ESTIMATE_NODE_TYPE">
    <v-text-field
      v-model="graphStore.getComputedVariableName(node.id).value"
      label="Variable Name"
      disabled
    ></v-text-field>
    <v-combobox v-model="node.options.distribution" label="Distribution" :items="AVAILABLE_DISTRIBUTIONS"></v-combobox>
    <div v-if="node.options.distribution != 'deterministic'" class="lower-upper-inputs">
      <v-number-input v-model="node.options.lower" label="Lower" control-variant="split"></v-number-input>
      <v-number-input v-model="node.options.upper" label="Upper" control-variant="split"></v-number-input>
    </div>
    <div v-else>
      <v-number-input v-model="node.options.lower" label="Value" control-variant="split"></v-number-input>
    </div>
  </div>
  <div v-if="node.type == OPERATION_NODE_TYPE">
    <v-text-field
      v-model="graphStore.getComputedVariableName(node.id).value"
      label="Variable Name"
      disabled
    ></v-text-field>
    <v-text-field v-model="operationNodeExpressionInputValue" label="Expression or Formula"></v-text-field>
    <v-alert v-if="!!operationNodeExpressionError" color="error" :text="operationNodeExpressionError" />
  </div>
  <div v-if="node.type == RESULT_NODE_TYPE">
    <v-text-field
      v-for="(item, i) in [...node.options.variables, '']"
      :key="i"
      :model-value="item"
      :label="`Result Variable ${i + 1}`"
      @update:model-value="event => onResultVariableChange(i, event)"
    ></v-text-field>
  </div>
</template>

<style scoped lang="scss">
  .v-text-field {
    min-width: 18em;
  }

  .v-number-input {
    min-width: 13em;
  }

  .lower-upper-inputs {
    display: flex;
    gap: 1em;
  }
</style>
