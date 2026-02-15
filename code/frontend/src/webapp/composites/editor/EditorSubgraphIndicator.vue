<script lang="ts" setup>
    import { useEditorStore } from "@/state/editor";

    const editor = useEditorStore();
</script>

<template>
    <div v-if="editor.transient.subgraphId != null" class="subgraphIndicatorContainer">
        <span class="subgraphTitle">
            {{ editor.computedSubgraphTitle }}
        </span>
        <v-tooltip location="bottom" text="switch to parent subgraph" open-delay="500">
            <template #activator="{ props }">
                <v-btn
                    v-bind="props"
                    icon="mdi-exit-to-app"
                    variant="flat"
                    class="subgraphCloseButton"
                    size="small"
                    @click="editor.switchToParentSubgraph"
                />
            </template>
        </v-tooltip>
    </div>
</template>

<style lang="scss" scoped>
    .subgraphIndicatorContainer {
        position: absolute;
        top: 1em;
        left: 50%;
        transform: translate(-50%);

        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.5em;
        padding: 0.25em 0.25em 0.25em 1.5em;

        border-radius: 2em;
        background-color: #fff;
    }

    .subgraphCloseButton {
        padding: 0;
    }
</style>
