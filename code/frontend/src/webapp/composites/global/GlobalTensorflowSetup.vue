<script setup lang="ts">
    import { useComputationStore } from "@/state/computation";
    import { getBackend, setBackend, ready as tensorflowReady, ENV as tensorflowENV } from "@tensorflow/tfjs";
    import { watch } from "vue";

    const computation = useComputationStore();

    watch(
        () => computation.persisted.frontend.gpuAcceleration,
        gpuAcceleration => {
            tensorflowReady().then(async () => {
                if (gpuAcceleration) {
                    await setBackend("webgl");
                } else {
                    await setBackend("cpu");
                }

                const backend = getBackend();
                const float32support = tensorflowENV.getBool("WEBGL_RENDER_FLOAT32_CAPABLE");
                const float32enabled = tensorflowENV.getBool("WEBGL_RENDER_FLOAT32_ENABLED");
                console.log(
                    `tensorflow is ready with backend '${backend}' (float32 = ${float32support && float32enabled})`
                );
            });
        }
    );
</script>

<template>
    <div v-if="false" />
</template>
