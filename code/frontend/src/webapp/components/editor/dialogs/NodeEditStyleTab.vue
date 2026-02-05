<script setup lang="ts">
    import { VColorInput } from "vuetify/labs/VColorInput";

    import FlowNodeBox from "../graph/FlowNodeBox.vue";

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
        NODE_STYLE_SHAPE_VARIANTS,
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
        <div class="preview">
            <FlowNodeBox
                width="auto"
                height="auto"
                :node-type="node.type"
                :function-type="node.function.type"
                :style-type="node.visualization.style.type"
                :custom-style="node.visualization.style.type == CUSTOM_STYLE_TYPE ? node.visualization.style : null"
            >
                {{ node.visualization.title }}
            </FlowNodeBox>
        </div>

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

        <template v-if="node.visualization.style.type == CUSTOM_STYLE_TYPE">
            <h4>Options</h4>
            <v-combobox
                v-model="node.visualization.style.shape"
                label="Shape"
                :items="NODE_STYLE_SHAPE_VARIANTS"
            ></v-combobox>

            <VColorInput
                v-model="node.visualization.style.backgroundColor"
                hide-pip
                label="Background Color"
            ></VColorInput>

            <v-combobox
                v-model="node.visualization.style.border"
                label="Border"
                :items="NODE_STYLE_BORDER_VARIANTS"
            ></v-combobox>

            <v-slider
                v-model="node.visualization.style.borderWidth"
                min="0.5"
                max="5"
                step="0.5"
                label="Border Width"
                thumb-label
                show-ticks
            ></v-slider>
        </template>
    </div>
</template>

<style scoped lang="scss">
    h4 {
        font-weight: 400;
    }

    .v-text-field {
        min-width: 25em;
    }

    .preview {
        display: flex;
        justify-content: center;
        margin: 1;
    }

    .v-slider {
        margin-right: 2em;
    }
</style>
