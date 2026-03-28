<script setup lang="ts">
    import EditorComposite from "../composites/editor/EditorComposite.vue";
    import TopMenu from "../composites/menu/TopMenu.vue";
    import LeftNavigation from "../composites/menu/LeftNavigation.vue";
</script>

<template>
    <TopMenu>
        <LeftNavigation>
            <EditorComposite />
        </LeftNavigation>
    </TopMenu>
</template>
