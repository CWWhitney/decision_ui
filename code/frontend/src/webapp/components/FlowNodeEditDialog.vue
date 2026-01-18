<script setup lang="ts">
  import {
    NODE_EDIT_DATA_TAB,
    NODE_EDIT_DEBUG_TAB,
    NODE_EDIT_FUNCTION_TAB,
    NODE_EDIT_GENERAL_TAB,
    NODE_EDIT_STYLE_TAB,
    useDialogsNodeEditStore
  } from "@/state/dialogs/nodeEdit";

  import FlowNodeEditGeneralTab from "./FlowNodeEditGeneralTab.vue";
  import FlowNodeEditFunctionTab from "./FlowNodeEditFunctionTab.vue";
  import FlowNodeEditDebugTab from "./FlowNodeEditDebugTab.vue";

  const store = useDialogsNodeEditStore();
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
            <FlowNodeEditGeneralTab v-model="store.node" />
          </v-tabs-window-item>
          <v-tabs-window-item :value="NODE_EDIT_FUNCTION_TAB">
            <FlowNodeEditFunctionTab v-model="store.node" />
          </v-tabs-window-item>
          <v-tabs-window-item :value="NODE_EDIT_DATA_TAB">
            <p>Data Tab</p>
          </v-tabs-window-item>
          <v-tabs-window-item :value="NODE_EDIT_STYLE_TAB">
            <p>Style Tab</p>
          </v-tabs-window-item>
          <v-tabs-window-item :value="NODE_EDIT_DEBUG_TAB">
            <FlowNodeEditDebugTab v-model="store.node" />
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
      background: transparent;
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

    .v-card {
      min-width: 20em;
      max-width: 90%;
      margin: 0 auto;
      padding: 0.5em;
      width: auto;
    }

    .v-card-text {
      overflow: hidden;
    }
  }
</style>
