<script setup lang="ts">
    import TopMenu from "@/composites/menu/TopMenu.vue";
    import LeftNavigation from "@/composites/menu/LeftNavigation.vue";
    import WorkspaceCards from "../components/layout/WorkspaceCards.vue";
    import DebouncedTextInput from "@/components/form/DebouncedTextInput.vue";
    import { useMetadataStore } from "@/state/metadata";

    const metadata = useMetadataStore();
</script>

<template>
    <TopMenu>
        <LeftNavigation>
            <WorkspaceCards>
                <v-card color="white" elevation="1" rounded>
                    <v-card-title>Metadata</v-card-title>
                    <v-card-text>
                        <DebouncedTextInput v-model="metadata.state.name" label="Model Name" />
                        <v-textarea v-model="metadata.state.description" label="Description"></v-textarea>
                        <v-text-field v-model="metadata.state.creationDate" label="Creation Date" disabled />
                        <v-text-field v-model="metadata.state.lastModified" label="Last Modified" disabled />
                    </v-card-text>
                </v-card>
            </WorkspaceCards>
        </LeftNavigation>
    </TopMenu>
</template>
