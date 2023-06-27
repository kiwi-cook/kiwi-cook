<template>
    <IonCard v-if="isBakingStep">
        <IonCardHeader>
            <IonCardTitle>
                Baking
            </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
            <IonItem>
                <IonInput :value="information.temperature" label="Bake at" label-placement="stacked"
                          placeholder="Temperature" readonly type="number"/>
                °C
            </IonItem>
            <IonItem>
                <IonInput :value="information.duration" label="for" label-placement="stacked" placeholder="Time"
                          readonly
                          type="number"/>
                minutes
            </IonItem>
            <IonItem>
                <IonInput :value="information.bakingType" label="using" label-placement="stacked"
                          placeholder="Temperature" readonly
                          type="text"/>
            </IonItem>
        </IonCardContent>
    </IonCard>
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