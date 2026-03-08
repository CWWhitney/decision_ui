<script setup lang="ts">
    import { useGraphStore } from "@/state/graph";
    import {
        EMPTY_FUNCTION_TYPE,
        ESTIMATE_FUNCTION_TYPE,
        generateVariableName,
        getDefaultFunctionState,
        LOOP_FUNCTION_TYPE,
        OPERATION_FUNCTION_TYPE,
        RESULT_FUNCTION_TYPE,
        VARIABLE_NODE_TYPE,
        type AbstractNode,
        type EstimateNodeFunctionState,
        type LoopNodeFunctionState,
        type Node,
        type NodeFunctionType,
        type OperationNodeFunctionState,
        type ResultNodeFunctionState,
        type VariableNodeType
    } from "@decision-support-ui/common";
    import { computed } from "vue";

    import LoopFunctionTab from "../../../components/editor/dialogs/LoopFunctionTab.vue";
    import EstimateFunctionTab from "@/components/editor/dialogs/EstimateFunctionTab.vue";
    import OperationFunctionTab from "@/components/editor/dialogs/OperationFunctionTab.vue";
    import DebouncedTextInput from "@/components/form/DebouncedTextInput.vue";
    import HelpHintWrapper from "@/components/form/HelpHintWrapper.vue";

    const node = defineModel<Node>({ required: true });
    const graphStore = useGraphStore();

    const knownVariables = computed(() =>
        graphStore.state.nodes
            .filter(n => n.type == VARIABLE_NODE_TYPE)
            .filter(n => n.id != node.value.id)
            .map(n => n.function.variable)
    );

    const computationError = computed(() => {
        try {
            graphStore.getComputedTypedTensor(node.value.id);
        } catch (e) {
            return e instanceof Error ? e.message : `${e}`;
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
            <p>Define how the value of this node is being calculated and referenced from other nodes:</p>
            <h4>Variable</h4>
            <HelpHintWrapper to="/help/user-interface/model-editor">
                <template #default>
                    <DebouncedTextInput
                        v-model="node.function.variable"
                        label="Variable Name"
                        hide-details
                        :transform="generateVariableName"
                    />
                </template>
                <template #tooltip>
                    The name of the variable representing the result of the calculation defined below. You can reference
                    this node in other nodes using this variable name.
                </template>
            </HelpHintWrapper>
        </template>
        <h4>Type</h4>
        <div>
            <HelpHintWrapper to="/help/user-interface/model-editor">
                <template #default>
                    <v-btn-toggle
                        v-model="functionType"
                        divided
                        border
                        variant="text"
                        color="primary"
                        class="functionTypeGroup"
                    >
                        <v-btn prepend-icon="mdi-tilde" text="Estimate" :value="ESTIMATE_FUNCTION_TYPE" />
                        <v-btn prepend-icon="mdi-plus-minus" text="Operation" :value="OPERATION_FUNCTION_TYPE" />
                        <v-btn prepend-icon="mdi-repeat" text="Loop" :value="LOOP_FUNCTION_TYPE" />
                        <v-btn prepend-icon="mdi-chart-histogram" text="Result" :value="RESULT_FUNCTION_TYPE" />
                    </v-btn-toggle>
                </template>
                <template #tooltip>
                    The function type of a node determines how the variable for this node is calculated:
                    <ul>
                        <li>Estimate - the variable is calculated from a random distribution with given parameters</li>
                        <li>
                            Operation - the variable is calculated from a mathemtical formula based on other variables
                        </li>
                        <li>Loop - the variable describes a time series calculated from two mathematical formulas</li>
                        <li>Result - the variable describes the final output of the model that should be visualized</li>
                    </ul>
                </template>
            </HelpHintWrapper>
        </div>
        <h4>Definition</h4>
        <div v-if="node.function.type == ESTIMATE_FUNCTION_TYPE">
            <EstimateFunctionTab
                v-model="
                    node as AbstractNode<VariableNodeType, EstimateNodeFunctionState, any> //
                "
            />
        </div>
        <div v-if="node.function.type == OPERATION_FUNCTION_TYPE">
            <OperationFunctionTab
                v-model="
                    node as AbstractNode<VariableNodeType, OperationNodeFunctionState, any> //
                "
                :known-variables="knownVariables"
            />
        </div>
        <div v-if="node.function.type == LOOP_FUNCTION_TYPE">
            <LoopFunctionTab
                v-model="
                    node as AbstractNode<VariableNodeType, LoopNodeFunctionState, any> //
                "
            />
        </div>
        <div v-if="node.function.type == RESULT_FUNCTION_TYPE">
            <OperationFunctionTab
                v-model="
                    node as AbstractNode<VariableNodeType, ResultNodeFunctionState, any> //
                "
                :known-variables="knownVariables"
            />
        </div>
        <div>
            <v-alert
                v-if="!!computationError"
                type="error"
                variant="outlined"
                :text="`Computation Error: ${computationError}`"
                class="functionAlert"
            />
            <v-alert
                v-if="!computationError"
                class="functionAlert"
                type="success"
                variant="outlined"
                text="Variable definition is valid!"
            />
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

    .functionTypeGroup {
        display: flex;
        flex-wrap: wrap;

        :deep(button) {
            flex-grow: 1;
        }
    }

    .functionAlert {
        margin-top: 1em;
        margin-right: 3em;
    }
</style>
