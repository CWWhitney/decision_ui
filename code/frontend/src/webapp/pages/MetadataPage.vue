<script setup lang="ts">
    import TopMenu from "../composites/menu/TopMenu.vue";
    import LeftNavigation from "../composites/menu/LeftNavigation.vue";
    import WorkspaceCards from "../components/layout/CardContainer.vue";
    import DebouncedTextInput from "../components/form/DebouncedTextInput.vue";
    import { useMetadataStore } from "../state/metadata";

    const metadata = useMetadataStore();
</script>

<template>
    <TopMenu>
        <LeftNavigation>
            <WorkspaceCards>
                <v-card color="white" elevation="1" rounded class="metadataCard">
                    <v-card-item>
                        <template #title>Metadata</template>
                        <template #subtitle>Summarize your model with a name and description.</template>
                        <template #append>
                            <v-btn-group density="compact">
                                <v-tooltip location="bottom" text="go to help section" open-delay="500">
                                    <template #activator="{ props }">
                                        <v-btn v-bind="props" to="/help/user-interface/metadata/">
                                            <template #prepend>
                                                <v-icon size="large"> mdi-help-circle-outline </v-icon>
                                            </template>
                                            Help
                                        </v-btn>
                                    </template>
                                </v-tooltip>
                            </v-btn-group>
                        </template>
                    </v-card-item>
                    <v-card-text>
                        <DebouncedTextInput v-model="metadata.state.name" label="Name" />
                        <v-textarea v-model="metadata.state.description" label="Description"></v-textarea>
                        <v-text-field v-model="metadata.state.creationDate" label="Creation Date" disabled />
                        <v-text-field v-model="metadata.state.lastModified" label="Last Modified" disabled />
                    </v-card-text>
                </v-card>
            </WorkspaceCards>
        </LeftNavigation>
    </TopMenu>
</template>

<style lang="scss" scoped>
    .metadataCard {
        padding: 1em;
        flex-grow: 1;
    }
</style>
