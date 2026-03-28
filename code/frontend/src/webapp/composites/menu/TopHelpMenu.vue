<script setup lang="ts">
    import { useRouter } from "vue-router";

    import TopMenuItem from "../../components/menu/TopMenuItem.vue";
    import { useAiSupportDialogStore } from "../../state/ai_support";

    const router = useRouter();
    const aiSupportDialog = useAiSupportDialogStore();

    const onFoundABugClick = () => {
        window.open("https://github.com/CWWhitney/decision_ui/issues", "_blank");
    };

    const PRODUCTION_MODE = import.meta.env.MODE;
    const GIT_COMMIT_HASH = import.meta.env.VITE_APP_VERSION;
</script>

<template>
    <v-card class="helpMenuCard">
        <v-list class="list">
            <TopMenuItem title="Documentation" shortcut="CTRL + H" @click="router.push({ path: '/help' })" />
            <TopMenuItem title="Found a Bug?" shortcut="CTRL + B" @click="onFoundABugClick" />
            <v-divider />
            <TopMenuItem title="AI Support (Experiment)" @click="aiSupportDialog.openDialog" />
            <v-divider />
            <p>app version {{ GIT_COMMIT_HASH }} ({{ PRODUCTION_MODE }} mode)</p>
        </v-list>
    </v-card>
</template>

<style lang="scss" scoped>
    .helpMenuCard {
        p {
            padding: 1.25em 1em 0.5em 1em;
            text-align: center;
            font-size: 10pt;
            opacity: 0.5;
        }
    }
</style>
