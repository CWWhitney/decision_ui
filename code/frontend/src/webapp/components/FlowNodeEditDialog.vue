<script setup lang="ts">
  import { AVAILABLE_DISTRIBUTIONS } from "@/editor/distributions";
  import { useFlowStore } from "@/state/flow";
  import { computed } from "vue";

  const store = useFlowStore();

  const open = computed(() => store.dialogs.nodeEdit.open);
  const node = computed(() => store.dialogs.nodeEdit.node);

  const onResultVariableChange = (index: number, value: string) => {
    if (node.value && node.value.type == "result") {
      if (index < node.value.results.variables.length) {
        if (value.trim() == "") {
          node.value.results.variables = node.value.results.variables.filter((_, i) => i != index);
        } else {
          node.value.results.variables[index] = value;
        }
      } else if (value.trim() !== "") {
        node.value.results.variables.push(value.trim());
      }
    }
  };
</script>

<template>
  <v-dialog v-if="node" v-model="open" class="dialog">
    <v-card>
      <v-toolbar>
        <v-toolbar-title>{{ node.title }}</v-toolbar-title>

        <v-toolbar-items>
          <v-btn icon="mdi-close" @click="store.closeNodeEditDialog"></v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text class="cardText">
        <h4>General</h4>
        <v-text-field v-model="node.title" label="Title" required></v-text-field>
        <!--<v-combobox v-model="node.type" label="Type" :items="AVAILABLE_NODE_TYPES" :disabled="true"></v-combobox>-->

        <div v-if="node.type == 'estimate'">
          <h4>Estimate Parameters</h4>
          <v-combobox
            v-model="node.estimate.distribution"
            label="Distribution"
            :items="AVAILABLE_DISTRIBUTIONS"
          ></v-combobox>
          <div class="lower-upper-inputs">
            <v-number-input v-model="node.estimate.lower" label="Lower" control-variant="split"></v-number-input>
            <v-number-input v-model="node.estimate.upper" label="Upper" control-variant="split"></v-number-input>
          </div>
          <v-text-field v-model="node.estimate.comment" label="Comment"></v-text-field>
        </div>
        <div v-if="node.type == 'operation'">
          <h4>Operation Parameters</h4>
          <v-text-field v-model="node.operation.expression" label="Expression"></v-text-field>
        </div>
        <div v-if="node.type == 'result'">
          <h4>Result Parameters</h4>
          <v-text-field
            v-for="(item, i) in [...node.results.variables, '']"
            :key="i"
            :model-value="item"
            :label="`Variable ${i + 1}`"
            @update:model-value="event => onResultVariableChange(i, event)"
          ></v-text-field>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" variant="text" @click="store.closeNodeEditDialog">done</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
  .dialog {
    .v-toolbar {
      background: #fff;
    }

    .v-card {
      min-width: 30em;
      max-width: 90%;
      margin: 0 auto;
      padding: 0.5em;
      width: auto;

      h4 {
        margin-bottom: 1em;
      }

      .lower-upper-inputs {
        display: flex;
        gap: 1em;
      }
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
