<script lang="ts" setup>
    import DsuiLogo from "../../../../resources/images/logo.svg";
    import TopFileMenu from "./TopFileMenu.vue";
    import TopEditMenu from "./TopEditMenu.vue";
    import TopViewMenu from "./TopViewMenu.vue";
    import { useMetadataStore } from "@/state/metadata";
    import { useRoute } from "vue-router";
    import TopHelpMenu from "./TopHelpMenu.vue";
    import TopRunMenu from "./TopRunMenu.vue";

    const metadata = useMetadataStore();

    const route = useRoute();
    const isEditorRoute = route.name == "editor";
</script>

<template>
    <div class="topMenuContainer">
        <div class="bar">
            <div class="menu">
                <div class="logo">
                    <DsuiLogo />
                </div>
                <div>
                    <v-btn-group divided>
                        <v-menu>
                            <template #activator="{ props }">
                                <v-btn v-bind="props" text="File" variant="elevated"></v-btn>
                            </template>
                            <TopFileMenu />
                        </v-menu>
                        <v-menu>
                            <template #activator="{ props }">
                                <v-btn
                                    v-bind="props"
                                    text="Edit"
                                    :disabled="!isEditorRoute"
                                    :variant="!isEditorRoute ? 'plain' : 'elevated'"
                                ></v-btn>
                            </template>
                            <TopEditMenu />
                        </v-menu>

                        <v-menu>
                            <template #activator="{ props }">
                                <v-btn
                                    v-bind="props"
                                    text="View"
                                    :disabled="!isEditorRoute"
                                    :variant="!isEditorRoute ? 'plain' : 'elevated'"
                                ></v-btn>
                            </template>
                            <TopViewMenu />
                        </v-menu>

                        <v-menu>
                            <template #activator="{ props }">
                                <v-btn
                                    v-bind="props"
                                    text="Run"
                                    :disabled="!isEditorRoute"
                                    :variant="!isEditorRoute ? 'plain' : 'elevated'"
                                ></v-btn>
                            </template>
                            <TopRunMenu />
                        </v-menu>
                    </v-btn-group>
                </div>
            </div>
            <div>{{ metadata.state.name }}</div>
            <div>
                <v-btn-group divided>
                    <v-menu>
                        <template #activator="{ props }">
                            <v-btn v-bind="props" prepend-icon="mdi-help-circle-outline" text="Help"></v-btn>
                        </template>
                        <TopHelpMenu />
                    </v-menu>

                    <v-btn prepend-icon="mdi-account-circle" text="Account"></v-btn>
                </v-btn-group>
            </div>
        </div>
        <div class="content">
            <slot></slot>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    .topMenuContainer {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;

        .bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #eee;

            .logo {
                display: flex;
                align-items: center;
                margin: 0 0.75em;

                svg {
                    width: 2em;
                    height: auto;
                }
            }

            .menu {
                display: flex;
            }
        }

        .content {
            flex-grow: 1;
            position: relative;
            overflow: auto;
        }
    }
</style>
