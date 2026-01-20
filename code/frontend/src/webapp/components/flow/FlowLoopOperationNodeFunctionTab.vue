<script setup lang="ts">
    /**
     * Functions Tab of the Node Edit Dialog for Loop Operation Nodes
     */
    import { debounce } from "@/common/throttle";
    import { LOOP_OPERATION_NODE_TYPE, type Node } from "@decision-support-ui/common";
    import { computed, ref, watch } from "vue";

    const node = defineModel<Node>({ required: true });
    const props = defineProps({
        variableName: {
            type: String,
            required: true
        },
        debounceTime: {
            type: Number,
            default: 300,
            required: false
        }
    });

    const variableName = computed({
        get() {
            return props.variableName;
        },
        set() {
            // nothing
        }
    });

    const initExpressionInputValue = ref<string | null>(
        node.value.type == LOOP_OPERATION_NODE_TYPE ? node.value.options.initExpression : null
    );

    const iterExpressionInputValue = ref<string | null>(
        node.value.type == LOOP_OPERATION_NODE_TYPE ? node.value.options.iterExpression : null
    );

    const initExpression = computed(() => {
        if (node.value.type == LOOP_OPERATION_NODE_TYPE) {
            return node.value.options.initExpression;
        }
        return null;
    });

    const iterExpression = computed(() => {
        if (node.value.type == LOOP_OPERATION_NODE_TYPE) {
            return node.value.options.iterExpression;
        }
        return null;
    });

    watch(initExpression, value => {
        initExpressionInputValue.value = value;
    });

    watch(iterExpression, value => {
        iterExpressionInputValue.value = value;
    });

    watch(
        initExpressionInputValue,
        debounce((value: string | null) => {
            if (node.value.type == LOOP_OPERATION_NODE_TYPE && value) {
                node.value.options.initExpression = value ?? "";
            }
        }, props.debounceTime)
    );

    watch(
        iterExpressionInputValue,
        debounce((value: string | null) => {
            if (node.value.type == LOOP_OPERATION_NODE_TYPE && value) {
                node.value.options.iterExpression = value ?? "";
            }
        }, props.debounceTime)
    );
</script>

<template>
    <div v-if="node.type == LOOP_OPERATION_NODE_TYPE">
        <v-text-field v-model="variableName" label="Variable Name" disabled> </v-text-field>
        <v-text-field v-model="initExpressionInputValue" label="Initial Value Expression (i = 0)"></v-text-field>
        <v-text-field v-model="iterExpressionInputValue" label="Iteration Value Expression (i > 0)"></v-text-field>
    </div>
</template>

<style scoped lang="scss">
    .v-text-field {
        min-width: 25em;
    }
</style>
