<template>
    <BakingStepInfo :step="step" v-if="additionalComponent === 'baking'" />
    <!-- Add more -->
</template>

<script lang="ts">
import { Step } from '@/api/types';
import { PropType, toRefs, defineComponent, computed, ComputedRef } from 'vue';
import BakingStepInfo from '../step/StepInfoBaking.vue';

export default defineComponent({
    name: "StepInfo",
    props: {
        step: {
            type: Object as PropType<Step>,
            required: true
        }
    },
    components: { BakingStepInfo },
    setup(props: {
        step: Step;
    }) {
        const { step } = toRefs(props);
        const additionalComponent: ComputedRef<string> = computed(() => {
            let additionalComponent = "";
            if ("additional" in step.value) {
                const additional = step.value.additional;
                switch (additional?.informationType ?? "") {
                    case "baking":
                        additionalComponent = "baking";
                        break;
                    default:
                        additionalComponent = "";
                }
            }
            return additionalComponent;
        })
        return {
            additionalComponent
        };
    }
})
</script>