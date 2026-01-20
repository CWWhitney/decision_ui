<script setup lang="ts">
    /**
     * Functions Tab of the Node Edit Dialog for Loop Nodes
     */
    import { LOOP_NODE_TYPE, type Node } from "@decision-support-ui/common";

    const node = defineModel<Node>({ required: true });
</script>

<template>
    <div v-if="node.type == LOOP_NODE_TYPE">
        <v-number-input
            v-model="node.options.iterations"
            :precision="0"
            label="Loop Iterations"
            control-variant="split"
        ></v-number-input>
    </div>
</template>

<style scoped lang="scss">
    .v-number-input {
        min-width: 15em;
    }
</style>
