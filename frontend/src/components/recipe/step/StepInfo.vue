<template>
    <BakingStepInfo v-if="additionalComponent === 'baking'" :step="step"/>
    <!-- Add more -->
</template>

<script lang="ts">
import {Step} from '@/tastebuddy/types';
import {computed, ComputedRef, defineComponent, PropType, toRefs} from 'vue';
import BakingStepInfo from '../step/StepInfoBaking.vue';

export default defineComponent({
    name: "StepInfo",
    props: {
        step: {
            type: Object as PropType<Step>,
            required: true
        }
    },
    components: {BakingStepInfo},
    setup(props: {
        step: Step;
    }) {
        const {step} = toRefs(props);
        const additionalComponent: ComputedRef<string> = computed(() => {
            let additionalComponent = "";
            if ("additional" in step.value) {
                const additional = step.value.additional;
                // eslint-disable-next-line sonarjs/no-small-switch
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