<script setup lang="ts">
    import { useRStore } from "@/state/r";

    const rStore = useRStore();
</script>

<template>
    <v-dialog v-model="rStore.state.errorDialog.show" class="executionErrorDialog">
        <v-card max-width="50em">
            <v-card-title class="text-h5"> Model Execution Error </v-card-title>
            <v-card-text>
                <v-list lines="two">
                    <v-list-item title="Reason">
                        <template #subtitle>
                            <highlightjs language="text" :code="rStore.state.errorDialog.error?.reason || ''" />
                        </template>
                    </v-list-item>
                    <v-list-item title="R Output">
                        <template #subtitle>
                            <highlightjs language="text" :code="rStore.state.errorDialog.error?.stdout || ''" />
                        </template>
                    </v-list-item>
                    <v-list-item title="R Error Output">
                        <template #subtitle>
                            <highlightjs language="txt" :code="rStore.state.errorDialog.error?.stderr || ''" />
                        </template>
                    </v-list-item>
                    <v-list-item title="R Exit Code">
                        <template #subtitle>
                            <highlightjs language="txt" :code="rStore.state.errorDialog.error?.exitcode || ''" />
                        </template>
                    </v-list-item>
                </v-list>
            </v-card-text>
            <v-card-actions>
                <v-btn color="primary" variant="text" @click="rStore.state.errorDialog.show = false"> Got It </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<style scoped lang="scss">
    .executionErrorDialog {
        .v-card {
            padding: 1.5em 1em 1em 1em;
            margin: 0 auto;
        }

        .v-card-text {
            overflow: auto;
        }

        pre {
            max-height: 12em;
            overflow-y: auto;
            border: 1px solid #ddd;
            background: #eee;
            min-height: 2em;
        }
    }

    .executionErrorDialog ::v-deep(code.hljs) {
        background: #eee !important;
    }
</style>
