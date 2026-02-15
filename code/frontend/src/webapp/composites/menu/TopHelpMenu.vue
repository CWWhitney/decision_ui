<script setup lang="ts">
    import TopMenuItem from "@/components/menu/TopMenuItem.vue";
    import { useRouter } from "vue-router";

    const router = useRouter();

    const onFoundABugClick = () => {
        window.open("https://github.com/johanneskopton/decision_ui/issues", "_blank");
    };
</script>

<template>
    <v-card class="card">
        <v-list class="list">
            <TopMenuItem title="Documentation" shortcut="CTRL + H" @click="router.push({ path: '/help' })" />
            <TopMenuItem title="Found A Bug?" shortcut="CTRL + B" @click="onFoundABugClick" />
            <TopMenuItem title="AI Support" />
        </v-list>
    </v-card>
</template>

<style lang="scss" scoped></style>
