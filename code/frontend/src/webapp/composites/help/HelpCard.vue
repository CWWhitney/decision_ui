<script setup lang="ts">
    /* eslint vue/no-v-html: 0 */

    import { computed } from "vue";
    import { computedAsync } from "@vueuse/core";

    import markdownit from "markdown-it";
    import markdownit_replace_link from "markdown-it-replace-link";

    const props = defineProps<{ pathArray: string[] }>();

    const HELP_BASE_PATH = "#/help";

    const BREADCRUMB_TITLE_BY_SUBPATH: { [subpath: string]: string } = {
        "user-interface": "User Interface",
        "main-menu": "Main Menu",
        "model-editor": "Model Editor",
        "estimates-table": "Estimates Table",
        "r-backend": "R Backend",
        "getting-started": "Getting Started",
        "developer-guide": "Developer Guide",
        "advanced-features": "Advanced Features",
        "open-model-dialog": "Open Model Dialog",
        "save-model-dialog": "Save Model Dialog",
        "node-edit-dialog": "Node Edit Dialog",
        "analyze-model": "Analyze Model",
        "login-dialog": "Login Dialog",
        "formula-expression-input": "Formula Expression Input",
        "general-tab": "General Tab",
        "function-tab": "Function Tab",
        "data-tab": "Data Tab",
        "style-tab": "Style Tab",
        "analyze-tab": "Analyze Tab",
        "ai-support": "AI Support (Experiment)",
        metadata: "Metadata Page",
        windows: "Windows Installation",
        macos: "MacOS Installation",
        linux: "Linux Installation",
        evpi: "Expected Value of Perfect Information",
        subgraphs: "Subgraphs",
        installation: "Installation",
        settings: "Settings"
    };

    const breadcrumbs = computed(() => {
        const items = [
            {
                title: "Help",
                href: HELP_BASE_PATH
            }
        ];
        if (props.pathArray.join().trim() != "") {
            let path = HELP_BASE_PATH;
            for (const subpath of props.pathArray) {
                path = path + "/" + subpath;
                items.push({
                    title: BREADCRUMB_TITLE_BY_SUBPATH[subpath] || "???",
                    href: path
                });
            }
        }
        return items;
    });

    const fetchMarkdownSource = async (url: string) => {
        const response = await fetch(url);
        if (response.status == 200) {
            const text = await response.text();
            if (!text.trim().startsWith("#")) {
                throw Error("not a markdown file?");
            }
            return text;
        }
        throw Error("fetch failed");
    };

    const markdown = computedAsync(async () => {
        const path = props.pathArray.join("/");
        const readme_url = `./static/documentation/${path ?? ""}/README.md`.replace(/\/\//g, "/");

        const md = markdownit();

        // replace href links in markdown with correct urls
        md.use(markdownit_replace_link, {
            replaceLink: (link, env, token) => {
                console.log(`replace ${link} for token ${JSON.stringify(token)}`);
                if (token.type == "image") {
                    return `./static/documentation/${path}/${link}`;
                }
                if (link.startsWith("http://") || link.startsWith("https://")) {
                    token.attrSet("target", "_blank");
                    return link;
                }

                const basePath = "help/" + (props.pathArray.join().trim() != "" ? props.pathArray.join("/") + "/" : "");
                console.log(`basePath is ${basePath}`);
                const baseUrl = new URL(basePath, "http://dummy");
                return `#${new URL(link, baseUrl).pathname}`;
            }
        });

        try {
            console.log(`loading markdown from ${readme_url}`);
            return md.render(await fetchMarkdownSource(readme_url));
        } catch (err) {
            console.error(err);
            return `error retrieving markdown file: ${err}`;
        }
    });
</script>

<template>
    <v-card color="white" elevation="1" rounded class="card">
        <v-card-text>
            <v-breadcrumbs :items="breadcrumbs" class="breadcrumbs">
                <template #divider>
                    <v-icon icon="mdi-chevron-right"></v-icon>
                </template>
            </v-breadcrumbs>
            <div class="markdown" v-html="markdown" />
        </v-card-text>
    </v-card>
</template>

<style scoped lang="scss">
    .card {
        overflow-x: auto;
        flex-grow: 1;
        padding: 1em;
    }

    .breadcrumbs {
        float: right;
        padding-right: 0;
        padding-top: 0;
    }

    .markdown {
        ::v-deep(li) {
            margin: 0.5em 1em;
        }

        ::v-deep(ul) {
            margin: 1em 0em;
        }

        ::v-deep(h1) {
            font-size: 1.5em;
            margin-top: -0.25em;
            padding-bottom: 0.5em;
            margin-bottom: 1em;
            border-bottom: 1px solid #ddd;
        }

        ::v-deep(h2) {
            font-size: 1.3em;
            margin-top: 2em;
            margin-bottom: 0.5em;
        }

        ::v-deep(h3) {
            font-size: 1.2em;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
        }

        ::v-deep(h1),
        ::v-deep(h2),
        ::v-deep(h3) {
            font-weight: 500;
        }

        ::v-deep(img) {
            display: block;
            margin: 0 auto;
            max-width: 100%;
            border: 1px solid #aaa;
        }

        ::v-deep(p) {
            margin: 1em 0;
        }

        ::v-deep(code) {
            display: inline-block;
            background-color: #eee;
            padding: 0 0.25em;
        }

        ::v-deep(blockquote) {
            display: block;
            background-color: #eee;
            border-left: 4px solid #aaa;
            padding: 0.25em 1em;
            margin: 1em 0;
        }
    }
</style>
