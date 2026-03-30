<script setup lang="ts">
    import { ref } from "vue";

    const expanded = ref<boolean>(false);
</script>

<template>
    <div class="container">
        <v-navigation-drawer :rail="!expanded" permanent class="navigation-drawer">
            <v-list density="compact" nav>
                <v-tooltip location="right" text="Metadata" open-delay="500">
                    <template #activator="{ props }">
                        <v-list-item
                            :to="{ name: 'metadata' }"
                            v-bind="props"
                            prepend-icon="mdi-file-outline"
                            title="Metadata"
                        />
                    </template>
                </v-tooltip>
                <v-tooltip location="right" text="Model Editor" open-delay="500">
                    <template #activator="{ props }">
                        <v-list-item
                            :to="{ name: 'editor' }"
                            v-bind="props"
                            prepend-icon="mdi-sitemap mdi-rotate-90"
                            title="Editor"
                        />
                    </template>
                </v-tooltip>
                <v-tooltip location="right" text="Analyze Model" open-delay="500">
                    <template #activator="{ props }">
                        <v-list-item
                            :to="{ name: 'analyze' }"
                            v-bind="props"
                            prepend-icon="mdi-tune-variant"
                            title="Analyze"
                        />
                    </template>
                </v-tooltip>
                <v-tooltip location="right" text="Estimates Table" open-delay="500">
                    <template #activator="{ props }">
                        <v-list-item to="/estimates" v-bind="props" prepend-icon="mdi-table" title="Estimates" />
                    </template>
                </v-tooltip>
                <v-tooltip location="right" text="R Code" open-delay="500">
                    <template #activator="{ props }">
                        <v-list-item :to="{ name: 'r' }" v-bind="props" prepend-icon="mdi-language-r" title="R Code" />
                    </template>
                </v-tooltip>
            </v-list>
            <template #append>
                <v-list density="compact" nav>
                    <v-tooltip
                        location="right"
                        :text="expanded ? 'collapse Navigation Menu' : 'expand Navigation Menu'"
                        open-delay="500"
                    >
                        <template #activator="{ props }">
                            <v-list-item
                                v-bind="props"
                                :title="expanded ? 'Collapse' : 'Expand'"
                                :prepend-icon="expanded ? 'mdi-chevron-double-left' : 'mdi-chevron-double-right'"
                                @click="expanded = !expanded"
                            />
                        </template>
                    </v-tooltip>
                </v-list>
            </template>
        </v-navigation-drawer>
        <div class="content">
            <slot></slot>
        </div>
    </div>
</template>

<style scoped lang="scss">
    .container {
        display: flex;
        width: 100%;
        height: 100%;
    }

    .navigation-drawer {
        position: relative !important;
        top: 0 !important;
        height: 100% !important;
        flex-grow: 0;
        max-width: 11.9em;
    }

    :deep(.v-list-item-title) {
        text-transform: uppercase;
    }

    .content {
        background-color: rgb(245, 245, 245);
        position: relative;
        display: block;
        flex: 1 1;
        overflow: auto;
    }
</style>
