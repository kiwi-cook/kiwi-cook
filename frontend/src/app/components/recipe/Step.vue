<template>
    <IonCard>
        <IonImg :src="step?.imgUrl ?? ''"/>
        <IonCardHeader>
            <IonCardTitle>
                <h3>
                    <span class="recipe-step-index">{{ stepIndex + 1 }}</span><span
                        class="recipe-step-index-max"> / {{ amountSteps }}</span>
                </h3>
                <IonChip v-if="step?.duration ?? 0 > 0">
                    <IonIcon :icon="time"/>
                    <IonLabel>{{ step?.duration }} min.</IonLabel>
                </IonChip>
                <IonChip v-if="step?.temperature ?? 0 > 0">
                    <IonIcon :icon="flame"/>
                    <IonLabel>{{ step?.temperature }} °C</IonLabel>
                </IonChip>
            </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
            <IonItem lines="none">
                <ItemList :horizontal="true" :items="step.getStepItems()"/>
            </IonItem>
            <IonItem lines="none">
                <div v-html="step?.printDescription('item-highlight')"/>
            </IonItem>
        </IonCardContent>
    </IonCard>
</template>
<script lang="ts" setup>
import {flame, time} from "ionicons/icons";
import ItemList from "@/shared/components/utility/list/ItemList.vue";
import {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonChip,
    IonIcon,
    IonImg,
    IonItem,
    IonLabel
} from "@ionic/vue";
import {PropType} from "vue";
import {Step} from "@/shared";

defineProps({
    step: {
        type: Object as PropType<Step>,
        required: true
    },
    stepIndex: {
        type: Number,
        required: true
    },
    amountSteps: {
        type: Number,
        required: true
    }
})
</script>