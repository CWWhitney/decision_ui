<script setup lang="ts">
    import { useFlowGraphStore } from "@/state/flow/graph";
    import {
        EMPTY_FUNCTION_TYPE,
        ESTIMATE_FUNCTION_TYPE,
        getDefaultFunctionState,
        LOOP_FUNCTION_TYPE,
        OPERATION_FUNCTION_TYPE,
        RESULT_FUNCTION_TYPE,
        type AbstractNode,
        type EstimateNodeFunctionState,
        type LoopNodeFunctionState,
        type Node,
        type NodeFunctionType,
        type OperationNodeFunctionState,
        type ResultNodeFunctionState
    } from "@decision-support-ui/common";
    import { computed } from "vue";

    import FlowLoopNodeFunctionTab from "../components/flow/FlowLoopFunctionTab.vue";
    import FlowEstimateFunctionTab from "@/components/flow/FlowEstimateFunctionTab.vue";
    import FlowOperationFunctionTab from "@/components/flow/FlowOperationFunctionTab.vue";

    const node = defineModel<Node>({ required: true });
    const graphStore = useFlowGraphStore();

    const computationError = computed(() => {
        const computedTypedTensor = graphStore.getComputedTypedTensor(node.value.id);
        if (computedTypedTensor.value.type == "error") {
            return computedTypedTensor.value.message;
        }
        return null;
    });

    const functionType = computed({
        get: () => {
            return node.value.function.type;
        },
        set: (value: NodeFunctionType) => {
            if (node.value.function.type != EMPTY_FUNCTION_TYPE) {
                return (node.value.function = getDefaultFunctionState(node.value.function.variable, value));
            }
        }
    });
</script>

<template>
    <div>
        <template v-if="node.function.type != EMPTY_FUNCTION_TYPE">
            <h4>Variable</h4>
            <v-text-field v-model="node.function.variable" label="Variable Name" hide-details></v-text-field>
        </template>
        <h4>Type</h4>
        <div>
            <v-btn-toggle v-model="functionType" divided border variant="text" color="primary">
                <v-btn prepend-icon="mdi-tilde" text="Estimate" :value="ESTIMATE_FUNCTION_TYPE" />
                <v-btn prepend-icon="mdi-plus-minus" text="Operation" :value="OPERATION_FUNCTION_TYPE" />
                <v-btn prepend-icon="mdi-repeat" text="Loop" :value="LOOP_FUNCTION_TYPE" />
                <v-btn prepend-icon="mdi-chart-histogram" text="Result" :value="RESULT_FUNCTION_TYPE" />
            </v-btn-toggle>
        </div>
        <h4>Options</h4>
        <div v-if="node.function.type == ESTIMATE_FUNCTION_TYPE">
            <FlowEstimateFunctionTab
                v-model="
                    node as AbstractNode<EstimateNodeFunctionState, any> //
                "
            />
        </div>
        <div v-if="node.function.type == OPERATION_FUNCTION_TYPE">
            <FlowOperationFunctionTab
                v-model="
                    node as AbstractNode<OperationNodeFunctionState, any> //
                "
            />
        </div>
        <div v-if="node.function.type == LOOP_FUNCTION_TYPE">
            <FlowLoopNodeFunctionTab
                v-model="
                    node as AbstractNode<LoopNodeFunctionState, any> //
                "
            />
        </div>
        <div v-if="node.function.type == RESULT_FUNCTION_TYPE">
            <FlowOperationFunctionTab
                v-model="
                    node as AbstractNode<ResultNodeFunctionState, any> //
                "
            />
        </div>
        <div>
            <v-alert v-if="!!computationError" type="error" :text="`Computation Error: ${computationError}`" />
        </div>
    </div>
</template>

<style scoped lang="scss">
    .v-text-field {
        min-width: 25em;
    }

    .v-number-input {
        min-width: 15em;
    }
</style>
