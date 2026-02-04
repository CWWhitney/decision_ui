<script setup lang="ts">
    const props = defineProps<{ download: (format: string) => void }>();
</script>

<template>
    <div class="downloadButtons">
        <v-btn-group density="compact">
            <v-tooltip location="bottom" text="download chart as PNG image" open-delay="500">
                <template #activator="{ props: tooltipProps }">
                    <v-btn density="compact" v-bind="tooltipProps" @click.prevent="() => props.download('png')">
                        png
                    </v-btn>
                </template>
            </v-tooltip>
            <v-tooltip location="bottom" text="download chart as JPG image" open-delay="500">
                <template #activator="{ props: tooltipProps }">
                    <v-btn density="compact" v-bind="tooltipProps" @click.prevent="() => props.download('jpg')">
                        jpg
                    </v-btn>
                </template>
            </v-tooltip>
        </v-btn-group>
    </div>
</template>

<style scoped lang="scss">
    .downloadButtons {
        text-align: right;
    }
</style>
