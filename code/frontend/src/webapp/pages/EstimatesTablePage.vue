<script setup lang="ts">
    import TopMenu from "../composites/menu/TopMenu.vue";
    import LeftNavigation from "../composites/menu/LeftNavigation.vue";
    import LiveEstimatesTable from "../composites/estimates/LiveEstimatesTable.vue";
    import CardContainer from "../components/layout/CardContainer.vue";
</script>

<template>
    <TopMenu>
        <LeftNavigation>
            <CardContainer class="cardContainer">
                <LiveEstimatesTable />
            </CardContainer>
        </LeftNavigation>
    </TopMenu>
</template>
