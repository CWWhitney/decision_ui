<script setup lang="ts">
    import DebouncedTextInput from "@/components/form/DebouncedTextInput.vue";
    import {
        COLLECTION_NODE_TYPE,
        ESTIMATE_FUNCTION_TYPE,
        generateVariableName,
        SUBGRAPH_NODE_TYPE,
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

    const NODE_TYPE_ITEMS = [
        { title: "Variable", value: VARIABLE_NODE_TYPE },
        { title: "Collection", value: COLLECTION_NODE_TYPE },
        { title: "Subgraph", value: SUBGRAPH_NODE_TYPE }
    ];
</script>

<template>
    <div class="generalTabContainer">
        <div>General properties of this node:</div>

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
                <v-select v-model="node.type" label="Type" :items="NODE_TYPE_ITEMS" hide-details disabled />
            </template>
            <template #tooltip>
                The type of this node can not be edited. It depends on which node was added to the diagram. There are
                currently two types of nodes:
                <ul>
                    <li>"Variable" nodes define how model calculations are done</li>
                    <li>"Subgraph" nodes group nodes together by hiding them in a separate subgraph</li>
                    <li>"Collection" nodes visually group a set of nodes without hiding them</li>
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
        <div>
            <HelpHintWrapper to="/help/user-interface/model-editor">
                <template #default>
                    <v-switch
                        v-model="node.visualization.autoConnect"
                        label="Automatically draw edges based on computation dependencies"
                        color="primary"
                        hide-details
                        inset
                    ></v-switch>
                </template>
                <template #tooltip>
                    <p>
                        Whenever another node references this node's variable as part of its own variable definition, an
                        edge between these two nodes can be automatically drawn in the diagram, highlighting this
                        relationship.
                    </p>
                    <p>
                        Sometimes, e.g., when too many edges would make the diagram difficult to read, it can be helpful
                        to disable this feature.
                    </p>
                </template>
            </HelpHintWrapper>
        </div>
    </div>
</template>

<style scoped lang="scss">
    .generalTabContainer {
        display: flex;
        flex-direction: column;
        gap: 1em;
    }

    .v-text-field {
        min-width: 18em;
    }
</style>
