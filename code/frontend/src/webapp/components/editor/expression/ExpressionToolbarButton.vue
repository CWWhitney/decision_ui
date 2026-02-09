<script setup lang="ts">
    import { TOOLTIP_CLOSE_DELAY, TOOLTIP_OPEN_DELAY } from "@/common/constants";

    const props = defineProps<{
        label?: string;
        icon?: string;
        size?: string;
        tooltip?: string;
        syntax?: string;
        prependIcon?: string;
        click: () => void;
    }>();
</script>

<template>
    <v-tooltip
        location="top"
        :open-delay="TOOLTIP_OPEN_DELAY"
        :close-delay="TOOLTIP_CLOSE_DELAY"
        interactive
        class="tooltip"
    >
        <template #activator="{ props: tooltipProps }">
            <v-btn
                v-bind="tooltipProps"
                variant="outlined"
                :size="props.size ?? 'small'"
                :icon="props.icon"
                :text="props.label"
                class="button"
                @click="props.click"
            ></v-btn>
        </template>

        <template #default>
            <slot name="tooltip">
                <p v-if="props.tooltip">
                    {{ props.tooltip }}
                </p>
                <p v-if="props.syntax">
                    <code>{{ props.syntax }}</code>
                </p>
            </slot>
        </template>
    </v-tooltip>
</template>

<style lang="scss" scoped>
    .button {
        width: auto;
        height: auto;
        padding: 0.75em 0.5em;
        flex-grow: 1;
    }

    .tooltip {
        :deep(.v-overlay__content) {
            max-width: 50em !important;
            overflow: auto;
        }

        text-align: center;

        :deep(ul) {
            margin: 0.5em;
        }

        :deep(li) {
            margin-left: 0.5em;
        }
    }
</style>
