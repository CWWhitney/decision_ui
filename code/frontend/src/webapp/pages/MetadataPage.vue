<script setup lang="ts">
    import TopMenu from "@/composites/TopMenu.vue";
    import LeftNavigation from "@/composites/LeftNavigation.vue";
    import WorkspaceCards from "../components/WorkspaceCards.vue";
    import DebouncedTextInput from "@/components/flow/DebouncedTextInput.vue";
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
                        <DebouncedTextInput v-model="metadata.name" label="Model Name" />
                        <v-textarea v-model="metadata.description" label="Description"></v-textarea>
                        <v-text-field v-model="metadata.creationDate" label="Creation Date" disabled />
                        <v-text-field v-model="metadata.lastModified" label="Last Modified" disabled />
                    </v-card-text>
                </v-card>
            </WorkspaceCards>
        </LeftNavigation>
    </TopMenu>
</template>
