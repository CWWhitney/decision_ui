<script setup lang="ts">
    import JSZip from "jszip";
    import FileSaver from "file-saver";
    import { useGraphStore } from "@/state/graph";
    import { useRCodeStore } from "@/state/rcode";
    import * as common from "@decision-support-ui/common";

    const graph = useGraphStore();
    const rcode = useRCodeStore();

    const saveZip = () => {
        if (rcode.computedRCode == null) {
            return;
        }

        const zip = new JSZip();

        zip.file("script.R", rcode.computedRCode);
        zip.file(
            "estimates.csv",
            common.convertEstimatesToCSV(common.generateEstimatesTableFromGraph(graph.state.nodes))
        );
        zip.generateAsync({ type: "blob" }).then(function (content) {
            FileSaver.saveAs(content, "model.zip");
        });
    };

    const copyCode = () => {
        navigator.clipboard.writeText(rcode.computedRCode || "");
    };
</script>

<template>
    <v-card color="white" elevation="1" class="codeCard" rounded>
        <v-card-item>
            <template #title>R Code</template>
            <template #subtitle>The R script that corresponds to the model:</template>
            <template #append>
                <v-btn-group>
                    <v-tooltip location="bottom" open-delay="500">
                        <template #activator="{ props }">
                            <v-btn v-if="rcode.computedRCode !== null" v-bind="props" @click.prevent="copyCode">
                                <template #prepend>
                                    <v-icon> mdi-content-copy </v-icon>
                                </template>
                                Copy
                            </v-btn>
                        </template>
                        <span>Copy to Clipboard</span>
                    </v-tooltip>
                    <v-tooltip location="bottom" open-delay="500">
                        <template #activator="{ props }">
                            <v-btn v-if="rcode.computedRCode !== null" v-bind="props" @click.prevent="saveZip">
                                <template #prepend>
                                    <v-icon> mdi-folder-download-outline </v-icon>
                                </template>
                                Download
                            </v-btn>
                        </template>
                        <span>Download as ZIP</span>
                    </v-tooltip>
                    <v-tooltip location="bottom" text="go to help section" open-delay="500">
                        <template #activator="{ props }">
                            <v-btn v-bind="props" to="/help/user-interface/r-code/">
                                <template #prepend>
                                    <v-icon size="large"> mdi-help-circle-outline </v-icon>
                                </template>
                                Help
                            </v-btn>
                        </template>
                    </v-tooltip>
                </v-btn-group>
            </template>
        </v-card-item>

        <v-card-text>
            <highlightjs
                v-if="rcode.computedRCode !== null"
                language="r"
                :autodetect="false"
                :code="rcode.computedRCode"
                class="code"
            />
            <v-alert v-else type="info" variant="outlined"> Please add at least one result node to you model! </v-alert>
        </v-card-text>
    </v-card>
</template>

<style scoped lang="scss">
    .codeCard {
        padding: 1em;
        width: 100%;

        pre {
            margin: 1em 0 0 0;
            overflow-y: auto;
            border: 1px solid #ddd;
            min-height: 2em;
            font-size: 11pt;
            font-family:
                Roboto Mono,
                monospace !important;
        }
    }
</style>
