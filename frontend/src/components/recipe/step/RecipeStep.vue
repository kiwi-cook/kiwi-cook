<template>
    <ion-card>
        <ion-img :src="step?.imgUrl ?? ''"/>
        <ion-card-header>
            <ion-card-title color="light">
                Step {{ stepIndex + 1 }}
                <ion-chip v-if="step?.duration" color="light">
                    <ion-label>{{ step?.duration }} minutes</ion-label>
                </ion-chip>
            </ion-card-title>
        </ion-card-header>
        <ion-card-content>
            <SmallItemContainer :items="step.getItems()"/>
            <AdditionalStepInfo :step="step"/>
            <ion-item lines="none">
                <ion-text>
                    {{ step.description }}
                </ion-text>
            </ion-item>
        </ion-card-content>
    </ion-card>
</template>

<script lang="ts">
import {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonChip,
    IonImg,
    IonItem,
    IonLabel,
    IonText
} from '@ionic/vue';
import {defineComponent, PropType} from "vue";
import {Step} from "@/tastebuddy/types";
import SmallItemContainer from "@/components/item/SmallItemContainer.vue";
import AdditionalStepInfo from "@/components/recipe/step/StepInfo.vue";

export default defineComponent({
    name: 'RecipeStep',
    props: {
        stepIndex: {
            type: Number,
            required: true
        },
        step: {
            type: Object as PropType<Step>,
            required: true
        }
    },
    components: {
        SmallItemContainer, AdditionalStepInfo,
        IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonText, IonImg, IonChip, IonLabel
    },
    setup() {
        return {}
    }
})
</script>