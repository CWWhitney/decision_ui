<script setup lang="ts">
    import DebouncedTextInput from "@/components/form/DebouncedTextInput.vue";
    import {
        ESTIMATE_FUNCTION_TYPE,
        generateVariableName,
        VARIABLE_NODE_TYPE,
        type Node
    } from "@decision-support-ui/common";
    import HelpHintWrapper from "../../form/HelpHintWrapper.vue";

    const node = defineModel<Node>({ required: true });

    const onTitleChange = (title: string, previous: string) => {
        if (node.value.type == VARIABLE_NODE_TYPE) {
            if (generateVariableName(previous) == node.value.function.variable) {
                // auto-change variable in case it matches the default naming scheme
                node.value.function.variable = generateVariableName(title);
            }
        }
    };
</script>

<template>
    <div>
        <p>General properties of this node:</p>

        <HelpHintWrapper to="/help/user-interface/model-editor">
            <template #default>
                <DebouncedTextInput
                    v-model="node.visualization.title"
                    label="Title"
                    hide-details
                    required
                    @change="onTitleChange"
                />
            </template>
            <template #tooltip>
                This label is shown as a title for a node inside the diagram. It has no direct effect on the calculation
                of this node. However, in case no custom variable name was specified, the variable name for this node is
                automatically deduced from this title.
            </template>
        </HelpHintWrapper>

        <HelpHintWrapper to="/help/user-interface/model-editor">
            <template #default>
                <v-text-field v-model="node.type" label="Type" hide-details disabled />
            </template>
            <template #tooltip>
                The type of this node can not be edited. It depends on which node was added to the diagram. There are
                currently two types of nodes:
                <ul>
                    <li>"variable" nodes define how model calculations are done</li>
                    <li>"collection" nodes visually group a set of nodes</li>
                </ul>
            </template>
        </HelpHintWrapper>
        <div v-if="node.function.type == ESTIMATE_FUNCTION_TYPE">
            <HelpHintWrapper to="/help/user-interface/model-editor">
                <template #default>
                    <v-text-field
                        v-model="node.function.comment"
                        label="Comment for Estimate in CSV"
                        hide-details
                    ></v-text-field>
                </template>
                <template #tooltip>
                    The comment that is included in the Estimates CSV table for this estimate.
                </template>
            </HelpHintWrapper>
        </div>
    </div>
</template>

<style scoped lang="scss">
    .v-text-field {
        min-width: 18em;
    }
</style>
