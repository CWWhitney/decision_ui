import { resolve } from "path";

import childProcess from "child_process";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import vuetify from "vite-plugin-vuetify";
import svgLoader from "vite-svg-loader";

import { defineConfig, normalizePath } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// import vueDevTools from "vite-plugin-vue-devtools";

const commitHash = childProcess.execSync("git rev-parse --short HEAD").toString().trim();

export default defineConfig({
    root: "src/webapp/",
    envDir: "../../config",
    publicDir: "../../public",
    build: {
        outDir: "../../dist/webapp",
        emptyOutDir: true,
        chunkSizeWarningLimit: 8192
    },
    server: {
        proxy: {
            "/api": {
                target: "http://localhost:8080",
                secure: false,
                changeOrigin: true
            }
        }
    },
    plugins: [
        viteStaticCopy({
            targets: [
                {
                    src: normalizePath(resolve(__dirname, "../../documentation")),
                    dest: "static"
                }
            ],
            watch: {
                reloadPageOnChange: true
            }
        }),
        vue(),
        svgLoader(),
        vueJsx(),
        nodePolyfills(),
        vuetify()
    ],
    define: {
        "import.meta.env.VITE_APP_VERSION": JSON.stringify(commitHash)
    }
});
