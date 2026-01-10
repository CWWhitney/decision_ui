<script setup lang="ts">
  import { type GraphNode } from "@vue-flow/core";
  import { computed } from "vue";

  const props = defineProps<{ node: GraphNode | null }>();

  const emit = defineEmits<{
    (e: "close"): void;
  }>();

  const show = computed(() => !!props.node);

  function close() {
    emit("close");
  }

  console.log(`dialog props ${props}`);
</script>

<template>
  <v-dialog v-model="show" class="dialog">
    {{ `Hello` }}
    <v-card>
      <v-card-title class="text-h5">Edit Node "{{ props.node?.id }}"</v-card-title>
      <v-card-text class="cardText"> Hello World </v-card-text>
      <v-card-actions>
        <v-btn color="primary" variant="text" @click="close">close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
  .dialog {
    .v-card {
      max-width: 50em;
      padding: 0.75em;
      margin: 0 auto;
      width: auto;
    }

    .v-card-title {
      margin-top: 0.25em;
      margin-left: 0.25em;
    }

    .v-card-text {
      max-height: 40em;
      overflow: auto;
    }
  }
</style>
