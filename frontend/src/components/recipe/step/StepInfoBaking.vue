<template>
    <ion-card v-if="isBakingStep">
        <ion-card-header>
            <ion-card-title>
                Baking
            </ion-card-title>
        </ion-card-header>
        <ion-card-content>
            <ion-item>
                <ion-label position="stacked">Bake at</ion-label>
                <ion-input type="number" placeholder="Temperature" :value="information.temperature" readonly></ion-input>
                <ion-label position="stacked">°C</ion-label>
            </ion-item>
            <ion-item>
                <ion-label position="stacked">for</ion-label>
                <ion-input type="number" placeholder="Time" :value="information.duration" readonly></ion-input>
                <ion-label position="stacked">min</ion-label>
            </ion-item>
            <ion-item>
                <ion-label position="stacked">using</ion-label>
                <ion-input type="text" placeholder="Temperature" :value="information.bakingType" readonly />
            </ion-item>
        </ion-card-content>
    </ion-card>
</template>

<script lang="ts">
import { BakingStepInformation, Step } from '@/api/types';
import { computed, ComputedRef, defineComponent, PropType, toRefs } from 'vue';

export default defineComponent({
    name: 'BakingStepInfo',
    props: {
        step: {
            type: Object as PropType<Step>,
            required: true,
        },
    },
    setup(props: { step: Step }) {
        const { step } = toRefs(props);

        const isBakingStep: ComputedRef<boolean> = computed(() => {
            if ("additional" in step.value && step.value.additional?.informationType === "baking") {
                return true;
            }
            return false;
        });

        const information: ComputedRef<BakingStepInformation> = computed(() => {
            return step.value.additional as BakingStepInformation;
        })

        return {
            isBakingStep,
            information,
        };
    },
});
</script>