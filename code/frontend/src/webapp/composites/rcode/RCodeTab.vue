<script setup lang="ts">
    import JSZip from "jszip";
    import FileSaver from "file-saver";

    import { TOOLTIP_OPEN_DELAY } from "../../common/constants";
    import { type RExecutionStatus } from "../../state/r";
    import RRunButton from "../../components/r/RRunButton.vue";

    import RHint from "./RHint.vue";

    const props = withDefaults(
        defineProps<{
            code: string | null;
            description: string;
            status: RExecutionStatus;
            run: () => void;
            canRun: boolean;
            estimatesCsv: string;
        }>(),
        {}
    );

    const saveZip = () => {
        if (props.code == null) {
            return;
        }

        const zip = new JSZip();

        zip.file("script.R", props.code);
        zip.file("estimates.csv", props.estimatesCsv);
        zip.generateAsync({ type: "blob" }).then(function (content) {
            FileSaver.saveAs(content, "model.zip");
        });
    };

    const copyCode = () => {
        navigator.clipboard.writeText(props.code || "");
    };
</script>

<template>
    <div class="tabContainer">
        <v-toolbar class="codeToolbar">
            <template #prepend>
                <p>{{ props.description }}</p>
            </template>
            <template #append>
                <v-btn-group>
                    <v-tooltip location="top" :open-delay="TOOLTIP_OPEN_DELAY">
                        <template #activator="{ props: tooltipProps }">
                            <v-btn
                                v-if="props.code !== null"
                                v-bind="tooltipProps"
                                prepend-icon="mdi-content-copy"
                                text="Copy"
                                @click.prevent="copyCode"
                            />
                        </template>
                        <span>Copy to Clipboard</span>
                    </v-tooltip>
                    <v-tooltip location="top" :open-delay="TOOLTIP_OPEN_DELAY">
                        <template #activator="{ props: tooltipProps }">
                            <v-btn
                                v-if="props.code !== null"
                                v-bind="tooltipProps"
                                prepend-icon="mdi-tray-arrow-down"
                                text="Download"
                                @click.prevent="saveZip"
                            />
                        </template>
                        <span>Download as ZIP</span>
                    </v-tooltip>
                    <RRunButton :run="() => props.run()" :disabled="!canRun" :status="status" />
                </v-btn-group>
            </template>
        </v-toolbar>

        <RHint />
        <div class="codeContainer">
            <highlightjs v-if="props.code !== null" language="r" :autodetect="false" :code="props.code" class="code" />
        </div>
    </div>
</template>

<style scoped lang="scss">
    .tabContainer {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
    }

    .codeContainer {
        display: flex;
        overflow: hidden;

        :deep(pre) {
            width: 100%;
            margin: 0;
            overflow: auto;
            border: 1px solid #ddd;
            font-size: 11pt;
            font-family:
                Roboto Mono,
                monospace !important;
        }

        :deep(code) {
            overflow: visible;
        }
    }

    .codeToolbar {
        background-color: transparent;
    }

    .toolbarContent {
        min-width: 0;
        min-height: 0;
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
</style>
