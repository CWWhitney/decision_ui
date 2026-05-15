<script setup lang="ts">
    import TopMenu from "../composites/menu/TopMenu.vue";
    import LeftNavigation from "../composites/menu/LeftNavigation.vue";
    import HelpAllCards from "../composites/help/HelpAllCards.vue";
</script>

<template>
    <TopMenu>
        <LeftNavigation>
            <HelpAllCards />
        </LeftNavigation>
    </TopMenu>
</template>
