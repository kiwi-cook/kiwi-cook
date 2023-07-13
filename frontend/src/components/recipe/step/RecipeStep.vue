<template>
    <TwoColumnLayout layout="leftBigger">
        <template #left>
            <IonCard>
                <IonImg :src="step?.imgUrl ?? ''"/>
                <IonCardHeader>
                    <IonCardTitle>
                        {{ stepIndex + 1 }}. Step
                        <IonChip v-if="step?.duration">
                            <IonLabel>{{ step?.duration }} minutes</IonLabel>
                        </IonChip>
                    </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                    <AdditionalStepInfo :step="step"/>
                    <IonItem lines="none">
                        <IonText>
                            {{ step.description }}
                        </IonText>
                    </IonItem>
                </IonCardContent>
            </IonCard>
        </template>
        <template #right>
            <IonCard>
                <ItemList :items="step.getItems()" :disable-click="true"/>
            </IonCard>
        </template>
    </TwoColumnLayout>
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
import TwoColumnLayout from "@/components/layout/TwoColumnLayout.vue"

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
        ItemList,
        AdditionalStepInfo,
        IonCard,
        IonCardHeader,
        IonCardTitle,
        IonCardContent,
        IonItem,
        IonText,
        IonImg,
        IonChip,
        IonLabel,
        TwoColumnLayout
    },
    setup() {
        return {}
    }
})
</script>