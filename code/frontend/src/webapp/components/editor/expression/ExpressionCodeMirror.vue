<script lang="ts" setup>
    import { onMounted, onUnmounted, shallowRef, useTemplateRef, type ShallowRef, watch } from "vue";
    import { tags } from "@lezer/highlight";
    import { drawSelection, EditorView, highlightSpecialChars, keymap, tooltips } from "@codemirror/view";
    import { syntaxHighlighting, bracketMatching, HighlightStyle } from "@codemirror/language";
    import { EditorState, type Transaction } from "@codemirror/state";
    import {
        autocompletion,
        completionKeymap,
        closeBrackets,
        closeBracketsKeymap,
        type CompletionSource,
        CompletionContext,
        type CompletionResult,
        type CompletionSection
    } from "@codemirror/autocomplete";

    import { rLanguage } from "codemirror-lang-r";

    const model = defineModel<string>({
        required: true
    });

    const props = withDefaults(
        defineProps<{
            disabled?: boolean;
            knownVariables?: string[];
            knownFunctions?: string[];
            knownConstants?: string[];
        }>(),
        {
            knownVariables: () => [],
            knownFunctions: () => [],
            knownConstants: () => [],
            disabled: false
        }
    );

    const editor = useTemplateRef("editor");

    const view: ShallowRef<EditorView | undefined> = shallowRef(undefined);

    const myHighlightStyle = HighlightStyle.define([
        { tag: tags.literal, color: "#5e00a1" },
        { tag: tags.string, color: "#5e00a1" },
        { tag: tags.keyword, color: "#0015a1" },
        { tag: tags.function(tags.variableName), color: "#0097a1" }
    ]);

    const completionSource: CompletionSource = (context: CompletionContext) => {
        const word = context.matchBefore(/\w*/);
        if (!word) {
            return null;
        }
        if (word.from == word.to && !context.explicit) {
            return null;
        }
        return {
            from: word.from,
            options: [
                ...props.knownFunctions.map(v => ({
                    label: v,
                    type: "function",
                    section: { name: "Functions", rank: 1 } as CompletionSection
                })),
                ...props.knownVariables.map(v => ({
                    label: v,
                    type: "variable",
                    section: { name: "Variables", rank: 0 } as CompletionSection
                })),
                ...props.knownConstants.map(v => ({
                    label: v,
                    type: "constant",
                    section: { name: "Constants", rank: 2 } as CompletionSection
                }))
            ]
        } as CompletionResult;
    };

    const extensions = [
        highlightSpecialChars(),
        drawSelection(),
        syntaxHighlighting(myHighlightStyle),
        bracketMatching(),
        rLanguage,
        autocompletion({
            override: [completionSource]
        }),
        closeBrackets(),
        tooltips({ parent: document.body }),
        EditorView.lineWrapping,
        ...(props.disabled ? [EditorState.readOnly.of(true)] : []),
        keymap.of([...completionKeymap, ...closeBracketsKeymap])
    ];

    onMounted(() => {
        view.value = new EditorView({
            parent: editor.value as any,
            state: EditorState.create({ doc: model.value, extensions }),

            dispatch: (tr: Transaction) => {
                view.value?.update([tr]);

                if (!tr.changes.empty && tr.docChanged) {
                    model.value = tr.state.doc.toString();
                }
            }
        });
    });

    onUnmounted(() => {
        if (view.value) {
            view.value.destroy();
        }
    });

    watch(model, newModel => {
        if (view.value) {
            if (view.value.state.doc.toString() !== newModel) {
                view.value.dispatch({
                    changes: { from: 0, to: view.value.state.doc.length, insert: newModel }
                });
            }
        }
    });
</script>

<template>
    <div ref="editor" class="codemirrorContainer"></div>
</template>

<style lang="scss" scoped>
    .codemirrorContainer {
        display: flex;
    }
</style>

<style lang="scss">
    .cm-tooltip {
        z-index: 9999 !important;
    }

    .cm-editor {
        flex-grow: 1;
        outline: none !important;
    }

    .cm-scroller {
        overflow-y: auto;
        width: 100%;
        flex-grow: 1;
        max-height: 10em;
        padding: 0 0.5em 0.5em 0.5em;
    }

    .cm-tooltip-autocomplete {
        li[aria-selected="true"] {
            background: #17c;
        }

        completion-section:not(:first-child) {
            margin-top: 0.5em;
        }
    }
</style>
