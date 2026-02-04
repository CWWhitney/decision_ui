<script setup lang="ts">
    import { TOOLTIP_CLOSE_DELAY, TOOLTIP_OPEN_DELAY } from "@/common/constants";

    export type ExpressionToolbarButtonInfo = {
        label?: string;
        icon?: string;
        size?: string;
        expression: string;
        tooltip: string;
    };

    const props = defineProps<{
        list: ExpressionToolbarButtonInfo[];
        appendToExpression: (value: string) => void;
    }>();
</script>

<template>
    <v-tooltip
        v-for="item in props.list"
        :key="item.label"
        location="bottom"
        :text="item.tooltip"
        :open-delay="TOOLTIP_OPEN_DELAY"
        :close-delay="TOOLTIP_CLOSE_DELAY"
    >
        <template #activator="{ props: tooltipProps }">
            <v-btn
                v-bind="tooltipProps"
                variant="outlined"
                :size="item.size ?? 'small'"
                :icon="item.icon"
                :text="item.label"
                @click="appendToExpression(item.expression)"
            ></v-btn>
        </template>
    </v-tooltip>
</template>
