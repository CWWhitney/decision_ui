<script setup lang="ts">
    import FlowEditor from "@/composites/FlowEditor.vue";
    import TopMenu from "@/composites/TopMenu.vue";
    import LeftNavigation from "@/composites/LeftNavigation.vue";
</script>

<template>
    <TopMenu>
        <LeftNavigation>
            <FlowEditor />
        </LeftNavigation>
    </TopMenu>
</template>
