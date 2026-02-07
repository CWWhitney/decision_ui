<script setup lang="ts">
    import {
        NODE_STYLE_BOX_SHAPE,
        NODE_STYLE_ELLIPSE_SHAPE,
        NODE_STYLE_ROUNDED_BOX_SHAPE,
        type CustomNodeStyleState,
        type NodeFunctionType,
        type NodeStyleShapeVariant,
        type NodeStyleType,
        type NodeType
    } from "@decision-support-ui/common";
    import { computed } from "vue";
    import { darken, getLuma, parseColor, RGBtoCSS } from "vuetify/lib/util/colorUtils.mjs";

    const props = withDefaults(
        defineProps<{
            nodeType: NodeType;
            functionType: NodeFunctionType;
            styleType: NodeStyleType;
            customStyle?: CustomNodeStyleState | null;
            width?: string;
            height?: string;
        }>(),
        {
            customStyle: null,
            width: "100%",
            height: "100%"
        }
    );

    const containerStyle = computed(() => {
        return {
            width: props.width,
            height: props.height
        };
    });

    const getTextColor = (backgroundColor: string) => {
        return getLuma(backgroundColor) > 0.179 ? "#000000" : "#FFFFFF";
    };

    const BORDER_RADIUS_FOR_BOX_SHAPE: { [shape in NodeStyleShapeVariant]: string } = {
        [NODE_STYLE_BOX_SHAPE]: "0",
        [NODE_STYLE_ROUNDED_BOX_SHAPE]: "0.5em",
        [NODE_STYLE_ELLIPSE_SHAPE]: "50%"
    };

    const backgroundStyle = computed(() => {
        if (props.customStyle) {
            return {
                backgroundColor: props.customStyle.backgroundColor,
                borderStyle: props.customStyle.border,
                borderWidth: `${props.customStyle.borderWidth}px`,
                borderRadius: BORDER_RADIUS_FOR_BOX_SHAPE[props.customStyle.shape],
                borderColor: RGBtoCSS(darken(parseColor(props.customStyle.backgroundColor), 2))
            };
        }
        return {};
    });

    const contentStyle = computed(() => {
        if (props.customStyle) {
            return {
                color: getTextColor(props.customStyle.backgroundColor)
            };
        }
        return {};
    });
</script>

<template>
    <div
        :class="`flow-node-box container ${props.nodeType}-type ${props.functionType}-function-type ${props.styleType}-style-type`"
        :style="containerStyle"
    >
        <div class="background" :style="backgroundStyle"></div>
        <div class="content" :style="contentStyle">
            <slot></slot>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    .container {
        display: inline-grid;
    }

    .background {
        width: 100%;
        height: 100%;
        grid-area: 1 / 1;
    }

    .content {
        grid-area: 1 / 1;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0.5em 1em;
        overflow: hidden;
        text-align: center;
        word-break: break-word;
        cursor: pointer;
    }

    .cost-style-type .background {
        background-color: rgba(246, 137, 115, 0.8);
        border: 1.5px solid #8e432e;
    }

    .benefit-style-type .background {
        background-color: rgba(135, 238, 238, 0.8);
        border: 1.5px solid #2e8e8e;
    }

    .risk-style-type .background {
        background-color: rgba(241, 232, 110, 0.8);
        border: 1.5px solid #a29755;
    }

    .generic-style-type .background {
        background-color: rgba(255, 255, 255, 0.8);
        border-style: solid;
        border-width: 1.5px;
        border-color: #888888;
    }

    .result-style-type .background {
        background-color: rgba(235, 168, 235, 0.8);
        border: 1.5px solid #ac31ac;
    }

    .collection-style-type .background {
        background-color: rgba(209, 209, 209, 0.2);
        border-radius: 0.5em;
        border: 1.5px dashed #828282;
    }

    .collection-type .content {
        align-items: flex-start;
    }

    .subgraph-type .background {
        border-style: double;
        border-width: 4px;
    }

    .estimate-function-type .background {
        border-radius: 0;
    }

    .operation-function-type .background {
        border-radius: 0.5em;
    }

    .loop-function-type .background {
        border-radius: 0.5em;
    }

    .result-function-type .background {
        border-radius: 0;
    }

    .preview {
        display: flex;
        justify-content: center;
        position: relative;
        margin: 1em 0;

        .content {
            width: auto;
        }
    }
</style>
