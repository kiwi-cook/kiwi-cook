<template>
    <ion-card v-if="isBakingStep">
        <ion-card-header>
            <ion-card-title>
                Baking
            </ion-card-title>
        </ion-card-header>
        <ion-card-content>
            <ion-item>
                <ion-input :value="information.temperature" label="Bake at" label-placement="stacked"
                           placeholder="Temperature" readonly type="number"/>
                °C
            </ion-item>
            <ion-item>
                <ion-input :value="information.duration" label="for" label-placement="stacked" placeholder="Time"
                           readonly
                           type="number"/>
                minutes
            </ion-item>
            <ion-item>
                <ion-input :value="information.bakingType" label="using" label-placement="stacked"
                           placeholder="Temperature" readonly
                           type="text"/>
            </ion-item>
        </ion-card-content>
    </ion-card>
</template>

<script lang="ts">
import {BakingStepInformation, Step} from '@/tastebuddy/types';
import {IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonInput, IonItem} from '@ionic/vue';
import {computed, ComputedRef, defineComponent, PropType, toRefs} from 'vue';

export default defineComponent({
    name: 'BakingStepInfo',
    props: {
        step: {
            type: Object as PropType<Step>,
            required: true,
        },
    },
    components: {
        IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonInput,
    },
    setup(props: { step: Step }) {
        const {step} = toRefs(props);

        const isBakingStep: ComputedRef<boolean> = computed(() => {
            return "additional" in step.value && step.value.additional?.informationType === "baking";
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