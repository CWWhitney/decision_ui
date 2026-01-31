<script setup lang="ts">
    import {
        BENEFIT_STYLE_TYPE,
        COLLECTION_NODE_TYPE,
        COLLECTION_STYLE_TYPE,
        COST_STYLE_TYPE,
        CUSTOM_STYLE_TYPE,
        GENERIC_STYLE_TYPE,
        getDefaultNodeStyleState,
        type Node,
        NODE_STYLE_BORDER_VARIANTS,
        type NodeStyleType,
        RESULT_STYLE_TYPE,
        RISK_STYLE_TYPE,
        VARIABLE_NODE_TYPE
    } from "@decision-support-ui/common";
    import { computed } from "vue";

    const node = defineModel<Node>({ required: true });

    const styleType = computed({
        get: () => {
            return node.value.visualization.style.type;
        },
        set: (value: NodeStyleType) => {
            node.value.visualization.style = getDefaultNodeStyleState(value);
        }
    });
</script>

<template>
    <div>
        <h4>Preview</h4>
        <div
            :class="`vue-flow__node preview ${node.type}-type ${node.function.type}-function-type ${node.visualization.style.type}-style-type`"
        >
            <div class="content">{{ node.visualization.title }}</div>
        </div>
    </div>
    <div>
        <h4>Preset</h4>
        <div>
            <v-btn-toggle v-model="styleType" divided border variant="text" color="primary">
                <v-btn v-if="node.type == VARIABLE_NODE_TYPE" text="Cost" :value="COST_STYLE_TYPE" />
                <v-btn v-if="node.type == VARIABLE_NODE_TYPE" text="Benefit" :value="BENEFIT_STYLE_TYPE" />
                <v-btn v-if="node.type == VARIABLE_NODE_TYPE" text="Risk" :value="RISK_STYLE_TYPE" />
                <v-btn v-if="node.type == VARIABLE_NODE_TYPE" text="Generic" :value="GENERIC_STYLE_TYPE" />
                <v-btn v-if="node.type == VARIABLE_NODE_TYPE" text="Result" :value="RESULT_STYLE_TYPE" />
                <v-btn v-if="node.type == COLLECTION_NODE_TYPE" text="Collection" :value="COLLECTION_STYLE_TYPE" />
                <v-btn text="Custom" :value="CUSTOM_STYLE_TYPE" />
            </v-btn-toggle>
        </div>
    </div>
    <div v-if="node.visualization.style.type == CUSTOM_STYLE_TYPE">
        <h4>Options</h4>
        <v-combobox
            v-model="node.visualization.style.border"
            label="Border Variant"
            :items="NODE_STYLE_BORDER_VARIANTS"
        ></v-combobox>
    </div>
</template>

<style scoped lang="scss">
    .v-text-field {
        min-width: 25em;
    }
</style>
