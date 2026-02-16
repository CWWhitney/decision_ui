<script setup lang="ts">
    import TopMenu from "@/composites/menu/TopMenu.vue";
    import LeftNavigation from "@/composites/menu/LeftNavigation.vue";
    import CardContainer from "@/components/layout/CardContainer.vue";
    import EstimatesSlidersList from "@/composites/analyze/EstimatesSlidersList.vue";
    import ResultDiagramTabs from "@/composites/analyze/ResultDiagramTabs.vue";
</script>

<template>
    <TopMenu>
        <LeftNavigation>
            <CardContainer class="cardContainer">
                <v-card color="white" elevation="1" rounded class="estimatesCard">
                    <v-card-title> Analyze Model</v-card-title>
                    <v-card-text class="estimatesCardText">
                        <EstimatesSlidersList />
                    </v-card-text>
                </v-card>
                <v-card color="white" elevation="1" rounded class="resultsCard">
                    <v-card-text>
                        <ResultDiagramTabs />
                    </v-card-text>
                </v-card>
            </CardContainer>
        </LeftNavigation>
    </TopMenu>
</template>

<style lang="scss" scoped>
    .cardContainer {
        display: flex;
        height: 100%;
        width: 100%;
        align-items: stretch;
        overflow: hidden;
        flex-wrap: nowrap;
    }

    .estimatesCardText {
        overflow: auto;
        height: 100%;
        padding: 0;
    }

    .resultsCard {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        flex-shrink: 1;
        padding: 0.5em 1em 1em 1em;

        :deep(.v-window) {
            flex-grow: 1;
        }

        :deep(.v-window__container) {
            min-height: 100%;
        }

        :deep(.v-window-item) {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
        }

        :deep(.v-card-text) {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            padding-top: 0;
        }
    }

    .estimatesCard {
        display: flex;
        flex-direction: column;
        min-width: 22em;
        max-width: 30em;
        height: 100%;
        position: relative;
        padding: 1em;
    }
</style>
