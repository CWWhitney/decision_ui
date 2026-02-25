<script setup lang="ts">
    import TopMenu from "@/composites/menu/TopMenu.vue";
    import LeftNavigation from "@/composites/menu/LeftNavigation.vue";
    import CardContainer from "@/components/layout/CardContainer.vue";
    import RCodeCard from "@/composites/rcode/RCodeCard.vue";
</script>

<template>
    <TopMenu>
        <LeftNavigation>
            <CardContainer>
                <RCodeCard />
            </CardContainer>
        </LeftNavigation>
    </TopMenu>
</template>
