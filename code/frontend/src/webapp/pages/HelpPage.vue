<script setup lang="ts">
    import TopMenu from "@/composites/TopMenu.vue";
    import LeftNavigation from "@/composites/LeftNavigation.vue";
    import HelpDashboard from "@/components/HelpDashboard.vue";
</script>

<template>
    <TopMenu>
        <LeftNavigation>
            <HelpDashboard />
        </LeftNavigation>
    </TopMenu>
</template>
