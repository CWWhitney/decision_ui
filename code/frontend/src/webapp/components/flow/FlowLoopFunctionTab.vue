<script setup lang="ts">
    /**
     * Functions Tab of the Node Edit Dialog for Nodes with Loop Function Type
     */
    import { debounce } from "@/common/throttle";
    import { type LoopNodeFunctionState, type AbstractNode } from "@decision-support-ui/common";
    import { computed, ref, watch } from "vue";

    import FlowExpressionInput from "./FlowExpressionInput.vue";

    const node = defineModel<AbstractNode<LoopNodeFunctionState, any>>({ required: true });
    const props = defineProps({
        debounceTime: {
            type: Number,
            default: 300,
            required: false
        }
    });

    const iterationsInputValue = ref<number | null>(node.value.function.iterations);
    const iterations = computed(() => node.value.function.iterations);

    watch(iterations, value => {
        iterationsInputValue.value = value;
    });

    watch(
        iterationsInputValue,
        debounce((value: number) => {
            node.value.function.iterations = value;
        }, props.debounceTime)
    );
</script>

<template>
    <div>
        <v-number-input
            v-model="iterationsInputValue"
            :precision="0"
            label="Loop Iterations"
            control-variant="split"
        ></v-number-input>
        <FlowExpressionInput v-model="node.function.initExpression" label="Initial Value Expression (i = 0)" />
        <FlowExpressionInput v-model="node.function.iterExpression" label="Iteration Value Expression (i > 0)" />
    </div>
</template>

<style scoped lang="scss"></style>
