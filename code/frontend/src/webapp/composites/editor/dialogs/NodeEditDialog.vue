<script setup lang="ts">
    import { computed, ref } from "vue";

    import {
        NODE_EDIT_DATA_TAB,
        NODE_EDIT_DEBUG_TAB,
        NODE_EDIT_FUNCTION_TAB,
        NODE_EDIT_GENERAL_TAB,
        NODE_EDIT_STYLE_TAB,
        useDialogsNodeEditStore
    } from "@/state/dialogs";

    import { VARIABLE_NODE_TYPE } from "@decision-support-ui/common";
    import { useFlowGraphStore } from "@/state/graph";

    import NodeEditGeneralTab from "../../../components/editor/dialogs/NodeEditGeneralTab.vue";
    import NodeEditFunctionTab from "./NodeEditFunctionTab.vue";
    import NodeEditDebugTab from "./NodeEditDebugTab.vue";
    import NodeEditDataTab from "./NodeEditDataTab.vue";
    import NodeEditStyleTab from "../../../components/editor/dialogs/NodeEditStyleTab.vue";

    const store = useDialogsNodeEditStore();
    const graph = useFlowGraphStore();

    const node = computed(() => {
        const nodeId = store.nodeId;
        if (nodeId) {
            return graph.getComputedNode(nodeId).value;
        }
        return null;
    });

    const maximized = ref(false);

    const toggleMaximize = () => {
        maximized.value = !maximized.value;
    };
</script>

<template>
    <v-dialog
        v-if="node"
        v-model="store.isOpen"
        :width="maximized ? '90%' : 'auto'"
        :height="maximized ? '90%' : 'auto'"
        :class="`nodeEditDialog ${maximized ? 'maximized' : ''}`"
        @click:outside="store.closeDialog()"
    >
        <v-card>
            <v-toolbar>
                <v-toolbar-title>{{ node.visualization.title }}</v-toolbar-title>
                <v-toolbar-items>
                    <v-tooltip location="bottom" text="undo" open-delay="500">
                        <template #activator="{ props }">
                            <v-btn
                                v-bind="props"
                                icon="mdi-undo"
                                size="small"
                                :disabled="!graph.history.canUndo"
                                @click="graph.history.undo"
                            ></v-btn>
                        </template>
                    </v-tooltip>
                    <v-tooltip location="bottom" text="redo" open-delay="500">
                        <template #activator="{ props }">
                            <v-btn
                                v-bind="props"
                                icon="mdi-redo"
                                size="small"
                                :disabled="!graph.history.canRedo"
                                @click="graph.history.redo"
                            ></v-btn>
                        </template>
                    </v-tooltip>
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
                        v-if="node.type == VARIABLE_NODE_TYPE"
                        prepend-icon="mdi-function"
                        text="Function"
                        :value="NODE_EDIT_FUNCTION_TAB"
                    ></v-tab>
                    <v-tab
                        v-if="node.type == VARIABLE_NODE_TYPE"
                        prepend-icon="mdi-chart-histogram"
                        text="Data"
                        :value="NODE_EDIT_DATA_TAB"
                    ></v-tab>
                    <v-tab prepend-icon="mdi-palette-outline" text="Style" :value="NODE_EDIT_STYLE_TAB"></v-tab>
                    <v-tab
                        v-if="node.type == VARIABLE_NODE_TYPE"
                        prepend-icon="mdi-bug-outline"
                        text="Debug"
                        :value="NODE_EDIT_DEBUG_TAB"
                    ></v-tab>
                </v-tabs>
                <v-tabs-window v-model="store.tab">
                    <v-tabs-window-item :value="NODE_EDIT_GENERAL_TAB">
                        <NodeEditGeneralTab v-if="store.tab == NODE_EDIT_GENERAL_TAB" v-model="node" />
                    </v-tabs-window-item>
                    <v-tabs-window-item :value="NODE_EDIT_FUNCTION_TAB">
                        <NodeEditFunctionTab v-if="store.tab == NODE_EDIT_FUNCTION_TAB" v-model="node" />
                    </v-tabs-window-item>
                    <v-tabs-window-item :value="NODE_EDIT_DATA_TAB">
                        <NodeEditDataTab v-if="store.tab == NODE_EDIT_DATA_TAB" v-model="node" />
                    </v-tabs-window-item>
                    <v-tabs-window-item :value="NODE_EDIT_STYLE_TAB">
                        <NodeEditStyleTab v-if="store.tab == NODE_EDIT_STYLE_TAB" v-model="node" />
                    </v-tabs-window-item>
                    <v-tabs-window-item :value="NODE_EDIT_DEBUG_TAB">
                        <NodeEditDebugTab v-if="store.tab == NODE_EDIT_DEBUG_TAB" v-model="node" />
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
            min-width: 35em;
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

        p {
            margin: 1em 0;

            &:first-child {
                margin-top: 0;
            }
        }
    }
</style>
