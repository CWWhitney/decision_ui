<script lang="ts" setup>
    import DebouncedNumberInput from "@/components/form/DebouncedNumberInput.vue";
    import HelpHintWrapper from "@/components/form/HelpHintWrapper.vue";
    import { DETERMINISTIC_DISTRIBUTION } from "@/editor/distributions";
    import * as common from "@decision-support-ui/common";

    const node = defineModel<common.EstimateNode>({
        required: true
    });
</script>

<template>
    <p>Choose how this estimate is shown on the "Analyze Model" page:</p>
    <HelpHintWrapper to="/help/user-interface/model-editor">
        <template #default>
            <v-switch
                v-model="node.function.isModifiable"
                label="Allow modifying this estimate when analyzing this model"
                color="primary"
                hide-details
                inset
            ></v-switch>
        </template>
        <template #tooltip>
            If enabled, this estimate is shown on the "Analyze Model" page and can be adjusted using an interactive
            slider.
        </template>
    </HelpHintWrapper>
    <template v-if="node.function.isModifiable">
        <h4>Options</h4>
        <template v-if="node.function.distribution != DETERMINISTIC_DISTRIBUTION">
            <p class="noTopMargin">Choose an interval of allowed values for both lower and upper bounds:</p>
            <p class="noTopMargin">Lower Bound (5%-Quantile)</p>
            <HelpHintWrapper to="/help/user-interface/model-editor">
                <template #default>
                    <div class="parallelNumberInputs">
                        <DebouncedNumberInput
                            v-model="node.function.lowerBounds[0]"
                            label="Minimum"
                            :precision="null"
                            :transform="v => Math.min(node.function.lower, v)"
                            control-variant="split"
                            hide-details
                        />
                        <DebouncedNumberInput
                            v-model="node.function.lowerBounds[1]"
                            label="Maximum"
                            :precision="null"
                            :transform="v => Math.max(node.function.lower, v)"
                            control-variant="split"
                            hide-details
                        />
                    </div>
                </template>
                <template #tooltip>
                    If enabled, this estimate is shown on the "Analyze Model" page and can be adjusted using an
                    interactive slider.
                </template>
            </HelpHintWrapper>
            <p>Upper Bound (95%-Quantile)</p>
            <HelpHintWrapper to="/help/user-interface/model-editor">
                <template #default>
                    <div class="parallelNumberInputs">
                        <DebouncedNumberInput
                            v-model="node.function.upperBounds[0]"
                            label="Minimum"
                            :precision="null"
                            :transform="v => Math.min(node.function.upper, v)"
                            control-variant="split"
                            hide-details
                        />
                        <DebouncedNumberInput
                            v-model="node.function.upperBounds[1]"
                            label="Maximum"
                            :precision="null"
                            :transform="v => Math.max(node.function.upper, v)"
                            control-variant="split"
                            hide-details
                        />
                    </div>
                </template>
                <template #tooltip>
                    If enabled, this estimate is shown on the "Analyze Model" page and can be adjusted using an
                    interactive slider.
                </template>
            </HelpHintWrapper>
        </template>
        <template v-else>
            <p class="noTopMargin">Choose an interval of allowed values:</p>
            <HelpHintWrapper to="/help/user-interface/model-editor">
                <template #default>
                    <div class="parallelNumberInputs">
                        <DebouncedNumberInput
                            v-model="node.function.lowerBounds[0]"
                            label="Minimum"
                            :precision="null"
                            :transform="v => Math.min(node.function.lower, v)"
                            control-variant="split"
                            hide-details
                            @change="v => (node.function.upperBounds[0] = v)"
                        />
                        <DebouncedNumberInput
                            v-model="node.function.lowerBounds[1]"
                            label="Maximum"
                            :precision="null"
                            :transform="v => Math.max(node.function.lower, v)"
                            control-variant="split"
                            hide-details
                            @change="v => (node.function.upperBounds[1] = v)"
                        />
                    </div>
                </template>
                <template #tooltip>
                    If enabled, this estimate is shown on the "Analyze Model" page and can be adjusted using an
                    interactive slider.
                </template>
            </HelpHintWrapper>
        </template>
        <p>Increment / Decrement</p>
        <HelpHintWrapper to="/help/user-interface/model-editor">
            <template #default>
                <DebouncedNumberInput
                    v-model="node.function.rangeStep"
                    label="Step Size"
                    :precision="null"
                    :transform="v => Math.max(1e-12, v)"
                    control-variant="split"
                    hide-details
                />
            </template>
            <template #tooltip>
                <p>
                    This value decides the increment and decrement step size when adjusting this estimate on the
                    "Analyze Model" page. For example, a value of 100 declares that distribution parameters can only be
                    adjusted in 100 increments (e.g., 1000, 1100, 1200, etc.).
                </p>
                <p>
                    For estimates corresponding to time variables used in loop operations, make sure this step size is
                    an integer. Otherwise, modifying this estimate to a fraction will trigger an computation error on
                    the "Analyse Model" page.
                </p>
            </template>
        </HelpHintWrapper>
    </template>
</template>

<style lang="scss" scoped>
    .parallelNumberInputs {
        display: flex;
        gap: 1em;
    }

    .noTopMargin {
        margin-top: 0;
    }
</style>
