<script setup lang="ts">
    import { VColorInput } from "vuetify/labs/VColorInput";

    import FlowNodeBox from "../graph/FlowNodeBox.vue";

    import * as common from "@decision-support-ui/common";
    import { computed } from "vue";

    const node = defineModel<common.Node>({ required: true });

    const styleType = computed({
        get: () => {
            return node.value.visualization.style.type;
        },
        set: (value: common.NodeStyleType) => {
            node.value.visualization.style = common.getDefaultNodeStyleState(value);
        }
    });

    const selectableStyles = computed(() => {
        if (node.value.type == common.VARIABLE_NODE_TYPE) {
            return common.VARIABLE_NODE_STYLE_TYPES;
        } else if (node.value.type == common.COLLECTION_NODE_TYPE) {
            return common.COLLECTION_NODE_STYLE_TYPES;
        } else if (node.value.type == common.SUBGRAPH_NODE_TYPE) {
            return common.SUBGRAPH_NODE_STYLE_TYPES;
        }
        return [];
    });

    const STYLE_TYPE_LABELS: { [key in common.NodeStyleType]: string } = {
        [common.COST_STYLE_TYPE]: "Cost",
        [common.BENEFIT_STYLE_TYPE]: "Benefit",
        [common.RISK_STYLE_TYPE]: "Risk",
        [common.RESULT_STYLE_TYPE]: "Result",
        [common.GENERIC_STYLE_TYPE]: "Generic",
        [common.COLLECTION_STYLE_TYPE]: "Collection",
        [common.CUSTOM_STYLE_TYPE]: "Custom"
    };
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
                :custom-style="
                    node.visualization.style.type == common.CUSTOM_STYLE_TYPE ? node.visualization.style : null
                "
            >
                {{ node.visualization.title }}
            </FlowNodeBox>
        </div>

        <h4>Preset</h4>
        <div>
            <v-btn-toggle v-model="styleType" divided border variant="text" color="primary">
                <v-btn v-for="item in selectableStyles" :key="item" :text="STYLE_TYPE_LABELS[item]" :value="item" />
            </v-btn-toggle>
        </div>

        <template v-if="node.visualization.style.type == common.CUSTOM_STYLE_TYPE">
            <h4>Options</h4>
            <v-combobox
                v-model="node.visualization.style.shape"
                label="Shape"
                :items="common.NODE_STYLE_SHAPE_VARIANTS"
            ></v-combobox>

            <VColorInput
                v-model="node.visualization.style.backgroundColor"
                hide-pip
                label="Background Color"
            ></VColorInput>

            <v-combobox
                v-model="node.visualization.style.border"
                label="Border"
                :items="common.NODE_STYLE_BORDER_VARIANTS"
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

        :deep(.flow-node-box .content) {
            padding: 0.75em 1.25em;
        }
    }

    .v-slider {
        margin-right: 2em;
    }
</style>
