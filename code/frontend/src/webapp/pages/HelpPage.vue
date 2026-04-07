<script setup lang="ts">
    import TopMenu from "../composites/menu/TopMenu.vue";
    import LeftNavigation from "../composites/menu/LeftNavigation.vue";
    import HelpDashboard from "../composites/help/HelpDashboard.vue";
</script>

<template>
    <TopMenu>
        <LeftNavigation>
            <HelpDashboard />
        </LeftNavigation>
    </TopMenu>
</template>
