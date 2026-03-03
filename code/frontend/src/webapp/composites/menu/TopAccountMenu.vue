<script setup lang="ts">
    import TopMenuItem from "@/components/menu/TopMenuItem.vue";
    import { useAccountStore } from "@/state/account";
    import { useLoginDialogStore } from "@/state/account/login_dialog";

    const account = useAccountStore();
    const loginDialog = useLoginDialogStore();
</script>

<template>
    <v-card class="card">
        <v-list class="list">
            <TopMenuItem v-if="!account.isLoggedIn" title="Login or Register" @click="loginDialog.openDialog" />
            <TopMenuItem v-if="account.isLoggedIn" title="Logout" @click="account.logout" />
        </v-list>
    </v-card>
</template>

<style lang="scss" scoped></style>
