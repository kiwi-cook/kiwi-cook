<template>
    <IonCard>
        <IonImg :src="step?.imgUrl ?? ''"/>
        <IonCardHeader>
            <IonCardTitle>
                Step {{ stepIndex + 1 }}
                <IonChip v-if="step?.duration">
                    <IonLabel>{{ step?.duration }} minutes</IonLabel>
                </IonChip>
            </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
            <ItemList :items="step.getItems()"/>
            <AdditionalStepInfo :step="step"/>
            <IonItem lines="none">
                <IonText>
                    {{ step.description }}
                </IonText>
            </IonItem>
        </IonCardContent>
    </IonCard>
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
import ItemList from "@/components/recipe/ItemList.vue";
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
        ItemList, AdditionalStepInfo,
        IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonText, IonImg, IonChip, IonLabel
    },
    setup() {
        return {}
    }
})
</script>