<script setup lang="ts">
    import { TOOLTIP_CLOSE_DELAY, TOOLTIP_OPEN_DELAY } from "@/common/constants";
    import type { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric } from "vue-router";

    const props = defineProps<{
        to?: string | RouteLocationAsPathGeneric | RouteLocationAsRelativeGeneric | undefined;
    }>();

    const emits = defineEmits<{
        click: [];
    }>();
</script>

<template>
    <div class="container">
        <div class="content">
            <slot></slot>
        </div>
        <div class="hint">
            <v-tooltip
                location="bottom"
                :open-delay="TOOLTIP_OPEN_DELAY"
                :close-delay="TOOLTIP_CLOSE_DELAY"
                interactive
                class="tooltip"
            >
                <template #activator="{ props: tooltipProps }">
                    <v-btn
                        v-bind="tooltipProps"
                        icon="mdi-help"
                        variant="outlined"
                        size="x-small"
                        :to="props.to"
                        @click="emits('click')"
                    />
                </template>
                <slot name="tooltip"></slot>
            </v-tooltip>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    .container {
        display: flex;
        gap: 1em;
        align-items: center;
        margin: 1em 0;
    }

    .content {
        position: relative;
        flex-grow: 1;
    }

    .hint {
    }

    .tooltip {
        :deep(.v-overlay__content) {
            max-width: 50em !important;
        }

        :deep(ul) {
            margin: 0.5em;
        }

        :deep(li) {
            margin-left: 0.5em;
        }
    }
</style>
