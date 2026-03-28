<script setup lang="ts">
    import { computed } from "vue";

    import EstimateSlider from "../../components/estimates/EstimateSlider.vue";
    import { useGraphStore } from "../../state/graph";

    const graph = useGraphStore();

    const sortedEstimates = computed(() =>
        graph.computedEstimateNodes
            .filter(n => n.function.isModifiable)
            .sort((n1, n2) => n1.visualization.title.localeCompare(n2.visualization.title))
    );

    const noEstimateNodes = computed(() => sortedEstimates.value.length == 0);
</script>

<template>
    <div class="estimatesListContainer">
        <div v-if="noEstimateNodes">
            <v-alert
                type="info"
                variant="outlined"
                :text="`You need to add at least one Estimate node and declare it as modifiable on the 'Analyze' tab.`"
            />
        </div>
        <template v-else>
            <p>The model contains the following modifiable estimates:</p>
            <EstimateSlider v-for="(_, idx) in sortedEstimates" :key="idx" v-model="sortedEstimates[idx]!" />
        </template>
    </div>
</template>

<style lang="scss" scoped>
    .estimatesListContainer {
        display: flex;
        flex-direction: column;
        gap: 1.5em;
        height: 100%;
        overflow: auto;
        padding: 1em;
    }
</style>
