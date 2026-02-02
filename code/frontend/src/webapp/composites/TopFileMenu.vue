<script setup lang="ts">
    import TopMenuItem from "@/components/flow/TopMenuItem.vue";
</script>

<template>
    <v-card class="card">
        <v-list class="list">
            <TopMenuItem title="New" shortcut="CTRL + N" disabled @click="console.log('new file click')" />
            <v-divider />
            <TopMenuItem title="Open..." shortcut="CTRL + O" disabled @click="console.log('open file click')" />
            <TopMenuItem title="Save" shortcut="CTRL + S" disabled @click="console.log('save click')" />
            <TopMenuItem
                title="Save As..."
                shortcut="CTRL + SHIFT + S"
                disabled
                @click="console.log('save as click')"
            />
            <v-divider />
            <TopMenuItem title="Settings" disabled @click="console.log('settings click')" />
        </v-list>
    </v-card>
</template>

<style lang="scss" scoped></style>
