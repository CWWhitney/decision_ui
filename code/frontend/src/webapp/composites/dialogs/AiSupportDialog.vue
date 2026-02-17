<script setup lang="ts">
    import { useAiSupportDialogStore } from "@/state/ai_support";
    import { ref } from "vue";
    import AI_PROMPT_TOOL_DESCRIPTION from "../../../../resources/ai_prompt/tool_description.md?raw";
    import AI_PROMPT_GRAMMAR from "../../../../resources/ai_prompt/grammar.md?raw";
    import AI_PROMPT_RESPONSE from "../../../../resources/ai_prompt/response.md?raw";
    import { useGraphStore } from "@/state/graph";
    import * as common from "@decision-support-ui/common";

    const aiSupportDialog = useAiSupportDialogStore();
    const graph = useGraphStore();

    const includeModel = ref<boolean>(true);
    const userQuery = ref<string>("");

    const getNodeDescription = (node: common.VariableNode) => {
        if (node.function.type == common.ESTIMATE_FUNCTION_TYPE) {
            return (
                `- Estimate Variable: ${node.visualization.title}\n` +
                `  - Distribution: ${common.DISTRIBUTION_LABELS[node.function.distribution]}\n` +
                `  - Parameters: lower = ${node.function.lower}, upper = ${node.function.upper}`
            );
        } else if (node.function.type == common.OPERATION_FUNCTION_TYPE) {
            return (
                `- Operation Variable: ${node.visualization.title}\n` + `  - Expression: ${node.function.expression}`
            );
        } else if (node.function.type == common.LOOP_FUNCTION_TYPE) {
            return (
                `- Loop Variable: ${node.visualization.title}\n` +
                `  - Iterations: ${node.function.iterationsExpression}\n` +
                `  - Initial Value: ${node.function.initExpression}\n` +
                `  - Loop Value: ${node.function.loopExpression}`
            );
        } else if (node.function.type == common.RESULT_FUNCTION_TYPE) {
            return `- Result Variable: ${node.visualization.title}\n` + `  - Expression: ${node.function.expression}`;
        }

        return ``;
    };

    const getModelPrompt = () => {
        if (graph.state.nodes.length == 0) {
            return `### CURRENT MODEL\n\nThe user has not yet added any nodes to the model graph.`;
        }

        return (
            `### CURRENT MODEL\n\nThe following nodes have already been specified by the user:\n\n` +
            graph.state.nodes
                .filter(n => n.type == common.VARIABLE_NODE_TYPE)
                .map(n => getNodeDescription(n))
                .join("\n\n")
        );
    };

    const onCopyToClipboardClick = () => {
        const aiPrompt =
            `Assume you are an helpful assistant for a web application called "Decision Support UI".\n\n` +
            `${AI_PROMPT_TOOL_DESCRIPTION}\n\n` +
            `${AI_PROMPT_GRAMMAR}\n\n` +
            (includeModel.value ? `${getModelPrompt()}\n\n` : ``) +
            `${AI_PROMPT_RESPONSE}\n\n` +
            `### USER QUERY\n\n` +
            userQuery.value;

        navigator.clipboard.writeText(aiPrompt);
    };
</script>

<template>
    <v-dialog
        v-model="aiSupportDialog.isOpen"
        :width="'auto'"
        :height="'auto'"
        class="aiSupportDialog"
        @click:outside="aiSupportDialog.closeDialog()"
    >
        <v-card>
            <v-toolbar>
                <v-toolbar-title>AI Support (Experiment)</v-toolbar-title>
                <v-toolbar-items>
                    <v-btn icon="mdi-close" @click="aiSupportDialog.closeDialog()"></v-btn>
                </v-toolbar-items>
            </v-toolbar>

            <v-card-text>
                <p>
                    Below you may generate an AI prompt specialized to the Decision Support UI. Copy and insert it into
                    an AI service of your choosing.
                </p>
                <v-textarea v-model="userQuery" label="Your question" class="aiQuestion" hide-details> </v-textarea>
                <div class="copyButtonContainer">
                    <v-switch v-model="includeModel" label="Include current model" color="primary" inset hide-details />
                    <v-btn
                        text="Copy To Clipboard"
                        variant="outlined"
                        color="primary"
                        @click="onCopyToClipboardClick"
                    />
                </div>
            </v-card-text>

            <v-card-actions>
                <v-btn color="grey" variant="text" @click="aiSupportDialog.closeDialog()">close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<style lang="scss" scoped>
    .aiSupportDialog {
        .v-toolbar {
            background: transparent;
        }

        .v-card {
            padding: 0.5em;
        }

        .v-card-text {
            overflow: hidden;

            p {
                margin-bottom: 1em;
            }
        }

        :deep(.v-window) {
            width: 100%;
            min-width: 35em;
            min-height: 15em;
            overflow: auto;
        }
    }

    .copyButtonContainer {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
</style>
