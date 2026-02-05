<script lang="ts" setup>
    import DsuiLogo from "../../../../resources/images/logo.svg";
    import TopFileMenu from "./TopFileMenu.vue";
    import TopEditMenu from "./TopEditMenu.vue";
    import TopViewMenu from "./TopViewMenu.vue";
    import { useMetadataStore } from "@/state/metadata";

    const metadata = useMetadataStore();
</script>

<template>
    <div class="container">
        <div class="bar">
            <div class="menu">
                <div class="logo">
                    <DsuiLogo />
                </div>
                <div>
                    <v-btn-group divided>
                        <v-menu>
                            <template #activator="{ props }">
                                <v-btn v-bind="props" text="File"></v-btn>
                            </template>
                            <TopFileMenu />
                        </v-menu>
                        <v-menu>
                            <template #activator="{ props }">
                                <v-btn v-bind="props" text="Edit"></v-btn>
                            </template>
                            <TopEditMenu />
                        </v-menu>

                        <v-menu>
                            <template #activator="{ props }">
                                <v-btn v-bind="props" text="View"></v-btn>
                            </template>
                            <TopViewMenu />
                        </v-menu>
                    </v-btn-group>
                </div>
            </div>
            <div>{{ metadata.name }}</div>
            <div>
                <v-btn-group divided>
                    <v-btn prepend-icon="mdi-help-circle-outline" :to="{ name: 'help' }" text="Help"></v-btn>
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
    .container {
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
