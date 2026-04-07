<template>
    <div class="cardContainer">
        <slot />
    </div>
</template>

<style lang="scss" scoped>
    .cardContainer {
        display: flex;
        flex-wrap: wrap;
        align-items: start;

        gap: 0.75em;
        padding: 0.75em;
    }
</style>
