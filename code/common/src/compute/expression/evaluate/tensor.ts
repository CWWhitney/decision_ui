import { getBackend, ready as tensorflowReady, ENV as tensorflowENV } from "@tensorflow/tfjs";

tensorflowReady().then(() => {
    const backend = getBackend();
    const float32support = tensorflowENV.getBool("WEBGL_RENDER_FLOAT32_CAPABLE");
    const float32enabled = tensorflowENV.getBool("WEBGL_RENDER_FLOAT32_ENABLED");
    console.log(`tensorflow is ready with backend '${backend}' (float32 = ${float32support && float32enabled})`);
});
