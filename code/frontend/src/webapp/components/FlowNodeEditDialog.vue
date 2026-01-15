<script setup lang="ts">
  import { AVAILABLE_DISTRIBUTIONS } from "@/editor/distributions";
  import {
    NODE_EDIT_DATA_TAB,
    NODE_EDIT_DEBUG_TAB,
    NODE_EDIT_FUNCTION_TAB,
    NODE_EDIT_GENERAL_TAB,
    NODE_EDIT_STYLE_TAB,
    useDialogsNodeEditStore
  } from "@/state/dialogs/nodeEdit";
  import { useFlowGraphStore } from "@/state/flow/graph";
  import { ESTIMATE_NODE_TYPE, OPERATION_NODE_TYPE, RESULT_NODE_TYPE } from "@decision-support-ui/common";

  const store = useDialogsNodeEditStore();
  const graphStore = useFlowGraphStore();

  const onResultVariableChange = (index: number, value: string) => {
    if (store.node && store.node.type == RESULT_NODE_TYPE) {
      if (index < store.node.options.variables.length) {
        if (value.trim() == "") {
          store.node.options.variables = store.node.options.variables.filter((_, i) => i != index);
        } else {
          store.node.options.variables[index] = value;
        }
      } else if (value.trim() !== "") {
        store.node.options.variables.push(value.trim());
      }
    }
  };
</script>

<template>
  <v-dialog v-if="store.node" v-model="store.isOpen" class="dialog" @click:outside="store.closeDialog()">
    <v-card>
      <v-toolbar>
        <v-toolbar-title>{{ store.node.visualization.title }}</v-toolbar-title>
        <v-toolbar-items>
          <v-btn icon="mdi-close" @click="store.closeDialog()"></v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-card-text class="tabCard">
        <v-tabs v-model="store.tab" color="primary" direction="vertical">
          <v-tab prepend-icon="mdi-information-outline" text="General" :value="NODE_EDIT_GENERAL_TAB"></v-tab>
          <v-tab prepend-icon="mdi-function" text="Function" :value="NODE_EDIT_FUNCTION_TAB"></v-tab>
          <v-tab prepend-icon="mdi-chart-histogram" text="Data" :value="NODE_EDIT_DATA_TAB"></v-tab>
          <v-tab prepend-icon="mdi-palette-outline" text="Style" :value="NODE_EDIT_STYLE_TAB"></v-tab>
          <v-tab prepend-icon="mdi-bug-outline" text="Debug" :value="NODE_EDIT_DEBUG_TAB"></v-tab>
        </v-tabs>
        <v-tabs-window v-model="store.tab">
          <v-tabs-window-item :value="NODE_EDIT_GENERAL_TAB">
            <v-text-field v-model="store.node.visualization.title" label="Title" required></v-text-field>
            <div v-if="store.node.type == ESTIMATE_NODE_TYPE">
              <v-text-field v-model="store.node.options.comment" label="Comment for Estimate in CSV"></v-text-field>
            </div>
          </v-tabs-window-item>
          <v-tabs-window-item :value="NODE_EDIT_FUNCTION_TAB">
            <div v-if="store.node.type == ESTIMATE_NODE_TYPE">
              <v-combobox
                v-model="store.node.options.distribution"
                label="Distribution"
                :items="AVAILABLE_DISTRIBUTIONS"
              ></v-combobox>
              <div class="lower-upper-inputs">
                <v-number-input
                  v-model="store.node.options.lower"
                  label="Lower"
                  control-variant="split"
                ></v-number-input>
                <v-number-input
                  v-model="store.node.options.upper"
                  label="Upper"
                  control-variant="split"
                ></v-number-input>
              </div>
            </div>
            <div v-if="store.node.type == OPERATION_NODE_TYPE">
              <v-text-field v-model="store.node.options.expression" label="Expression or Formula"></v-text-field>
            </div>
            <div v-if="store.node.type == RESULT_NODE_TYPE">
              <v-text-field
                v-for="(item, i) in [...store.node.options.variables, '']"
                :key="i"
                :model-value="item"
                :label="`Result Variable ${i + 1}`"
                @update:model-value="event => onResultVariableChange(i, event)"
              ></v-text-field>
            </div>
          </v-tabs-window-item>
          <v-tabs-window-item :value="NODE_EDIT_DATA_TAB">
            <p>Data Tab</p>
          </v-tabs-window-item>
          <v-tabs-window-item :value="NODE_EDIT_STYLE_TAB">
            <p>Style Tab</p>
          </v-tabs-window-item>
          <v-tabs-window-item :value="NODE_EDIT_DEBUG_TAB">
            <h4>Node Data</h4>
            <pre>{{ JSON.stringify(graphStore.getComputedComputationResult(store.node.id).value, null, 2) }}</pre>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>

      <v-card-actions>
        <v-btn color="primary" variant="text" @click="store.closeDialog()">done</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
  .dialog {
    .v-toolbar {
      background: #fff;
    }

    .tabCard {
      display: flex;
      gap: 2em;
      justify-content: stretch;
      align-items: stretch;
    }

    .v-window {
      width: 100%;
      overflow: auto;
    }

    .v-number-input {
      min-width: 13em;
    }

    .v-text-field {
      min-width: 18em;
    }

    .v-card {
      min-width: 20em;
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
      overflow: hidden;
    }
  }
</style>
