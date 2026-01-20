<script setup lang="ts">
    import { debounce } from "@/common/throttle";
    import { AVAILABLE_DISTRIBUTIONS } from "@/editor/distributions";
    import { useFlowGraphStore } from "@/state/flow/graph";
    import {
        ESTIMATE_NODE_TYPE,
        getExpressionError,
        LOOP_NODE_TYPE,
        LOOP_OPERATION_NODE_TYPE,
        OPERATION_NODE_TYPE,
        RESULT_NODE_TYPE,
        type Node
    } from "@decision-support-ui/common";
    import { computed, ref, watch } from "vue";

    import FlowLoopNodeFunctionTab from "../components/flow/FlowLoopNodeFunctionTab.vue";
    import FlowLoopOperationNodeFunctionTab from "../components/flow/FlowLoopOperationNodeFunctionTab.vue";

    const node = defineModel<Node>({ required: true });
    const graphStore = useFlowGraphStore();

    const nodeWithExpressionInputValue = ref<string | null>(
        node.value.type == OPERATION_NODE_TYPE || node.value.type == RESULT_NODE_TYPE
            ? node.value.options.expression
            : null
    );

    const estimateNodeDeterministicValue = computed({
        get() {
            if (node.value.type == ESTIMATE_NODE_TYPE) {
                return node.value.options.lower;
            }
            return null;
        },
        set(value: number) {
            if (node.value.type == ESTIMATE_NODE_TYPE) {
                node.value.options.lower = value;
                node.value.options.upper = value;
            }
        }
    });

    const expressionOfNodeWithExpression = computed(() => {
        if (node.value.type == OPERATION_NODE_TYPE || node.value.type == RESULT_NODE_TYPE) {
            return node.value.options.expression;
        }
        return null;
    });

    watch(expressionOfNodeWithExpression, value => {
        nodeWithExpressionInputValue.value = value;
    });

    watch(
        nodeWithExpressionInputValue,
        debounce((value: string | null) => {
            if ((node.value.type == OPERATION_NODE_TYPE || node.value.type == RESULT_NODE_TYPE) && value) {
                graphStore.setNodeExpressionAction(node.value.id, value);
            }
        }, 300)
    );

    const expressionError = computed(() => {
        const expression = expressionOfNodeWithExpression.value;
        if (expression) {
            return getExpressionError(expression);
        }
        return null;
    });
</script>

<template>
    <div v-if="node.type == ESTIMATE_NODE_TYPE">
        <v-text-field
            v-model="graphStore.getComputedVariableName(node.id).value"
            label="Variable Name"
            disabled
        ></v-text-field>
        <v-combobox
            v-model="node.options.distribution"
            label="Distribution"
            :items="AVAILABLE_DISTRIBUTIONS"
        ></v-combobox>
        <div v-if="node.options.distribution != 'deterministic'" class="lower-upper-inputs">
            <v-number-input
                v-model="node.options.lower"
                :precision="null"
                label="Lower"
                control-variant="split"
            ></v-number-input>
            <v-number-input
                v-model="node.options.upper"
                :precision="null"
                label="Upper"
                control-variant="split"
            ></v-number-input>
        </div>
        <div v-else>
            <v-number-input
                v-model="estimateNodeDeterministicValue"
                :precision="null"
                label="Value"
                control-variant="split"
            ></v-number-input>
        </div>
    </div>
    <div v-if="node.type == OPERATION_NODE_TYPE">
        <v-text-field
            v-model="graphStore.getComputedVariableName(node.id).value"
            label="Variable Name"
            disabled
        ></v-text-field>
        <v-text-field v-model="nodeWithExpressionInputValue" label="Expression or Formula"></v-text-field>
        <v-alert v-if="!!expressionError" color="error" :text="expressionError" />
    </div>
    <div v-if="node.type == LOOP_NODE_TYPE">
        <FlowLoopNodeFunctionTab v-model="node" />
    </div>
    <div v-if="node.type == LOOP_OPERATION_NODE_TYPE">
        <FlowLoopOperationNodeFunctionTab
            v-model="node"
            :variable-name="graphStore.getComputedVariableName(node.id).value"
        />
    </div>
    <div v-if="node.type == RESULT_NODE_TYPE">
        <v-text-field
            v-model="graphStore.getComputedVariableName(node.id).value"
            label="Variable Name"
            disabled
        ></v-text-field>
        <v-text-field v-model="nodeWithExpressionInputValue" label="Expression or Formula"></v-text-field>
        <v-alert v-if="!!expressionError" color="error" :text="expressionError" />
    </div>
</template>

<style scoped lang="scss">
    .v-text-field {
        min-width: 25em;
    }

    .v-number-input {
        min-width: 15em;
    }

    .lower-upper-inputs {
        display: flex;
        gap: 1em;
    }
</style>
