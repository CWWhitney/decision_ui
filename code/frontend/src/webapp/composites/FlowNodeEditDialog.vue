<script setup lang="ts">
    import {
        NODE_EDIT_DATA_TAB,
        NODE_EDIT_DEBUG_TAB,
        NODE_EDIT_FUNCTION_TAB,
        NODE_EDIT_GENERAL_TAB,
        NODE_EDIT_STYLE_TAB,
        useDialogsNodeEditStore
    } from "@/state/dialogs/nodeEdit";

    import FlowNodeEditGeneralTab from "./FlowNodeEditGeneralTab.vue";
    import FlowNodeEditFunctionTab from "./FlowNodeEditFunctionTab.vue";
    import FlowNodeEditDebugTab from "./FlowNodeEditDebugTab.vue";
    import FlowNodeEditDataTab from "./FlowNodeEditDataTab.vue";
    import FlowNodeEditStyleTab from "../components/flow/FlowNodeEditStyleTab.vue";
    import { ref } from "vue";
    import { VARIABLE_NODE_TYPE } from "@decision-support-ui/common";

    const store = useDialogsNodeEditStore();

    const maximized = ref(false);

    const toggleMaximize = () => {
        maximized.value = !maximized.value;
    };
</script>

<template>
    <v-dialog
        v-if="store.node"
        v-model="store.isOpen"
        :width="maximized ? '90%' : 'auto'"
        :height="maximized ? '90%' : 'auto'"
        :class="`nodeEditDialog ${maximized ? 'maximized' : ''}`"
        @click:outside="store.closeDialog()"
    >
        <v-card>
            <v-toolbar>
                <v-toolbar-title>{{ store.node.visualization.title }}</v-toolbar-title>
                <v-toolbar-items>
                    <v-tooltip
                        location="bottom"
                        :text="maximized ? 'reduce window size' : 'maximize window size'"
                        open-delay="500"
                    >
                        <template #activator="{ props }">
                            <v-btn
                                v-bind="props"
                                :icon="maximized ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'"
                                @click="toggleMaximize"
                            />
                        </template>
                    </v-tooltip>

                    <v-btn icon="mdi-close" @click="store.closeDialog()"></v-btn>
                </v-toolbar-items>
            </v-toolbar>

            <v-card-text class="tabCard">
                <v-tabs v-model="store.tab" color="primary" direction="vertical">
                    <v-tab prepend-icon="mdi-information-outline" text="General" :value="NODE_EDIT_GENERAL_TAB"></v-tab>
                    <v-tab
                        v-if="store.node.type == VARIABLE_NODE_TYPE"
                        prepend-icon="mdi-function"
                        text="Function"
                        :value="NODE_EDIT_FUNCTION_TAB"
                    ></v-tab>
                    <v-tab
                        v-if="store.node.type == VARIABLE_NODE_TYPE"
                        prepend-icon="mdi-chart-histogram"
                        text="Data"
                        :value="NODE_EDIT_DATA_TAB"
                    ></v-tab>
                    <v-tab prepend-icon="mdi-palette-outline" text="Style" :value="NODE_EDIT_STYLE_TAB"></v-tab>
                    <v-tab
                        v-if="store.node.type == VARIABLE_NODE_TYPE"
                        prepend-icon="mdi-bug-outline"
                        text="Debug"
                        :value="NODE_EDIT_DEBUG_TAB"
                    ></v-tab>
                </v-tabs>
                <v-tabs-window v-model="store.tab">
                    <v-tabs-window-item :value="NODE_EDIT_GENERAL_TAB">
                        <FlowNodeEditGeneralTab v-model="store.node" />
                    </v-tabs-window-item>
                    <v-tabs-window-item :value="NODE_EDIT_FUNCTION_TAB">
                        <FlowNodeEditFunctionTab v-model="store.node" />
                    </v-tabs-window-item>
                    <v-tabs-window-item :value="NODE_EDIT_DATA_TAB">
                        <FlowNodeEditDataTab v-model="store.node" />
                    </v-tabs-window-item>
                    <v-tabs-window-item :value="NODE_EDIT_STYLE_TAB">
                        <FlowNodeEditStyleTab v-model="store.node" />
                    </v-tabs-window-item>
                    <v-tabs-window-item :value="NODE_EDIT_DEBUG_TAB">
                        <FlowNodeEditDebugTab v-model="store.node" />
                    </v-tabs-window-item>
                </v-tabs-window>
            </v-card-text>

            <v-card-actions>
                <v-btn color="primary" variant="text" @click="store.closeDialog()">done</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<style lang="scss">
    .nodeEditDialog {
        .v-toolbar {
            background: transparent;
        }

        .v-card {
            padding: 0.5em;
        }

        .v-card-text {
            overflow: hidden;
        }

        .tabCard {
            display: flex;
            gap: 2em;
            justify-content: stretch;
            align-items: stretch;
        }

        .v-window {
            width: 100%;
            min-width: 20em;
            overflow: auto;

            .v-window__container {
                min-height: 100%;
            }

            .v-window-item {
                display: flex;
                flex-direction: column;
                flex-grow: 1;
            }
        }

        h4 {
            font-size: 10pt;
            font-weight: 500;
            margin: 1.5em 0 1em 0;
            text-transform: uppercase;

            &:first-child {
                margin-top: 0;
            }
        }
    }
</style>
