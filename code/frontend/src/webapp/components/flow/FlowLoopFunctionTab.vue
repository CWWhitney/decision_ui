<script setup lang="ts">
    /**
     * Functions Tab of the Node Edit Dialog for Nodes with Loop Function Type
     */
    import { debounce } from "@/common/throttle";
    import { type LoopNodeFunctionState, type AbstractNode, type VariableNodeType } from "@decision-support-ui/common";
    import { computed, ref, watch } from "vue";

    import FlowExpressionInput from "./FlowExpressionInput.vue";
    import { USER_INPUT_DEBOUNCE_TIME } from "@/common/constants";

    const node = defineModel<AbstractNode<VariableNodeType, LoopNodeFunctionState, any>>({ required: true });
    const props = defineProps({
        debounceTime: {
            type: Number,
            default: USER_INPUT_DEBOUNCE_TIME,
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
            if (node.value.function.iterations != value) {
                node.value.function.iterations = value;
            }
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
