<script setup lang="ts">
    /**
     * Functions Tab of the Node Edit Dialog for Nodes with Loop Function Type
     */
    import { debounce } from "@/common/throttle";
    import { type LoopNodeFunctionState, type AbstractNode, getExpressionError } from "@decision-support-ui/common";
    import { computed, ref, watch } from "vue";

    const node = defineModel<AbstractNode<LoopNodeFunctionState, any>>({ required: true });
    const props = defineProps({
        debounceTime: {
            type: Number,
            default: 300,
            required: false
        }
    });

    const iterationsInputValue = ref<number | null>(node.value.function.iterations);
    const initExpressionInputValue = ref<string | null>(node.value.function.initExpression);
    const iterExpressionInputValue = ref<string | null>(node.value.function.iterExpression);

    const iterations = computed(() => node.value.function.iterations);
    const initExpression = computed(() => node.value.function.initExpression);
    const iterExpression = computed(() => node.value.function.iterExpression);

    watch(iterations, value => {
        iterationsInputValue.value = value;
    });

    watch(initExpression, value => {
        initExpressionInputValue.value = value;
    });

    watch(iterExpression, value => {
        iterExpressionInputValue.value = value;
    });

    watch(
        iterationsInputValue,
        debounce((value: number) => {
            node.value.function.iterations = value;
        }, props.debounceTime)
    );

    watch(
        initExpressionInputValue,
        debounce((value: string) => {
            node.value.function.initExpression = value;
        }, props.debounceTime)
    );

    watch(
        iterExpressionInputValue,
        debounce((value: string) => {
            node.value.function.iterExpression = value;
        }, props.debounceTime)
    );

    const initExpressionError = computed(() => {
        if (initExpression.value) {
            return getExpressionError(initExpression.value);
        }
        return null;
    });

    const iterExpressionError = computed(() => {
        if (iterExpression.value) {
            return getExpressionError(iterExpression.value);
        }
        return null;
    });
</script>

<template>
    <div>
        <v-number-input
            v-model="iterationsInputValue"
            :precision="0"
            label="Loop Iterations"
            control-variant="split"
        ></v-number-input>
        <v-text-field v-model="initExpressionInputValue" label="Initial Value Expression (i = 0)"></v-text-field>
        <v-alert v-if="initExpressionError" type="error" :text="initExpressionError" />
        <v-text-field v-model="iterExpressionInputValue" label="Iteration Value Expression (i > 0)"></v-text-field>
        <v-alert v-if="iterExpressionError" type="error" :text="iterExpressionError" />
    </div>
</template>

<style scoped lang="scss">
    .v-text-field {
        min-width: 25em;
    }
</style>
