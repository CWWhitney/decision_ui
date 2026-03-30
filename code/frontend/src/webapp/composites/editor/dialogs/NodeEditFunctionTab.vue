<script setup lang="ts">
    import { computed } from "vue";
    import * as common from "@decision-support-ui/common";

    import { useGraphStore } from "../../../state/graph";

    import LoopFunctionTab from "../../../components/editor/dialogs/LoopFunctionTab.vue";
    import EstimateFunctionTab from "../../../components/editor/dialogs/EstimateFunctionTab.vue";
    import OperationFunctionTab from "../../../components/editor/dialogs/OperationFunctionTab.vue";
    import DebouncedTextInput from "../../../components/form/DebouncedTextInput.vue";
    import HelpHintWrapper from "../../../components/form/HelpHintWrapper.vue";

    const node = defineModel<common.Node>({ required: true });
    const graph = useGraphStore();

    const knownVariables = computed(() =>
        graph.state.nodes
            .filter(n => n.type == common.VARIABLE_NODE_TYPE)
            .filter(n => n.id != node.value.id)
            .map(n => n.function.variable)
    );

    const computationError = computed(() => {
        try {
            graph.getComputedTypedTensor(node.value.id);
        } catch (e) {
            return e instanceof Error ? e.message : `${e}`;
        }
        return null;
    });

    const functionType = computed({
        get: () => {
            return node.value.function.type;
        },
        set: (value: common.NodeFunctionType) => {
            if (node.value.function.type != common.EMPTY_FUNCTION_TYPE) {
                return (node.value.function = common.getDefaultFunctionState(node.value.function.variable, value));
            }
        }
    });
</script>

<template>
    <div>
        <template v-if="node.function.type != common.EMPTY_FUNCTION_TYPE">
            <p>Define how the value of this node is being calculated and referenced from other nodes:</p>
            <h4>Variable</h4>
            <HelpHintWrapper to="/help/user-interface/model-editor">
                <template #default>
                    <DebouncedTextInput
                        v-model="node.function.variable"
                        label="Variable Name"
                        hide-details
                        :transform="common.generateVariableName"
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
                        <v-btn prepend-icon="mdi-tilde" text="Estimate" :value="common.ESTIMATE_FUNCTION_TYPE" />
                        <v-btn prepend-icon="mdi-plus-minus" text="Operation" :value="common.OPERATION_FUNCTION_TYPE" />
                        <v-btn prepend-icon="mdi-repeat" text="Loop" :value="common.LOOP_FUNCTION_TYPE" />
                        <v-btn prepend-icon="mdi-chart-histogram" text="Result" :value="common.RESULT_FUNCTION_TYPE" />
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
        <div v-if="node.function.type == common.ESTIMATE_FUNCTION_TYPE">
            <EstimateFunctionTab
                v-model="
                    node as common.AbstractNode<common.VariableNodeType, common.EstimateNodeFunctionState, any> //
                "
            />
        </div>
        <div v-if="node.function.type == common.OPERATION_FUNCTION_TYPE">
            <OperationFunctionTab
                v-model="
                    node as common.AbstractNode<common.VariableNodeType, common.OperationNodeFunctionState, any> //
                "
                :known-variables="knownVariables"
            />
        </div>
        <div v-if="node.function.type == common.LOOP_FUNCTION_TYPE">
            <LoopFunctionTab
                v-model="
                    node as common.AbstractNode<common.VariableNodeType, common.LoopNodeFunctionState, any> //
                "
                :known-variables="knownVariables"
            />
        </div>
        <div v-if="node.function.type == common.RESULT_FUNCTION_TYPE">
            <OperationFunctionTab
                v-model="
                    node as common.AbstractNode<common.VariableNodeType, common.ResultNodeFunctionState, any> //
                "
                :known-variables="knownVariables"
            />
        </div>
        <div>
            <v-alert
                v-if="!!computationError"
                type="error"
                variant="outlined"
                :text="`${computationError}`"
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
