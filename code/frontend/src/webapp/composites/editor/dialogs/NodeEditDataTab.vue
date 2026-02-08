<script setup lang="ts">
    import { SUBGRAPH_NODE_TYPE, VARIABLE_NODE_TYPE, type Node } from "@decision-support-ui/common";

    import VariableNodeEditDataTab from "./VariableNodeEditDataTab.vue";
    import SubgraphNodeEditDataTab from "./SubgraphNodeEditDataTab.vue";

    const node = defineModel<Node>({ required: true });
</script>

<template>
    <template v-if="node.type == VARIABLE_NODE_TYPE">
        <VariableNodeEditDataTab v-model="node" />
    </template>
    <template v-if="node.type == SUBGRAPH_NODE_TYPE">
        <SubgraphNodeEditDataTab v-model="node" />
    </template>
</template>

<style scoped lang="scss"></style>
