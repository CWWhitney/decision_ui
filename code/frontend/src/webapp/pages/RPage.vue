<script setup lang="ts">
    import TopMenu from "../composites/menu/TopMenu.vue";
    import LeftNavigation from "../composites/menu/LeftNavigation.vue";
    import CardContainer from "../components/layout/CardContainer.vue";
    import RCard from "../composites/rcode/RCard.vue";
</script>

<template>
    <TopMenu>
        <LeftNavigation>
            <CardContainer class="cardContainer">
                <RCard />
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
</style>
