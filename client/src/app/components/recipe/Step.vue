<template>
    <IonCard>
        <IonImg :src="step?.imgUrl ?? ''"/>
        <IonCardHeader>
            <IonCardTitle v-if="step.type === STEP_TYPES.STEP">
                <h3 v-if="stepIndex >= 0">
                    <span class="recipe-step-index">{{ stepIndex + 1 }}</span>
                    <span v-if="amountSteps > 0"
                          class="recipe-step-index-max"> / {{ amountSteps }}</span>
                </h3>
                <Duration :duration="step?.duration" @click="startTimer"/>
                <Temperature :temperature="step?.temperature"/>
            </IonCardTitle>
            <IonCardTitle v-else-if="step.type === STEP_TYPES.HEADER">
                <h3>
                    <div v-html="step?.printDescription('item-highlight')"/>
                </h3>
            </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
            <IonItem v-if="stepItems.length > 0" lines="none">
                <ItemList :items="stepItems" horizontal quantity-position="start"/>
            </IonItem>
            <!-- Show the description here of the step if it is not a header -->
            <IonItem v-if="step.type !== STEP_TYPES.HEADER" lines="none">
                <div v-html="step?.printDescription('item-highlight')"/>
            </IonItem>
        </IonCardContent>
    </IonCard>
</template>
<script lang="ts" setup>
import ItemList from '@/shared/components/utility/list/ItemList.vue';
import {IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonImg, IonItem} from '@ionic/vue';
import {computed, PropType, toRefs} from 'vue';
import {Step, STEP_TYPES} from '@/shared/ts';
import Duration from '@/shared/components/recipe/chip/Duration.vue';
import Temperature from '@/shared/components/recipe/chip/Temperature.vue';
import {useTasteBuddyStore} from '@/app/storage';

const props = defineProps({
    step: {
        type: Object as PropType<Step>,
        required: true
    },
    stepIndex: {
        type: Number,
        required: false,
        default: -1
    },
    amountSteps: {
        type: Number,
        required: false,
        default: -1
    },
    recipeId: {
        type: String,
        required: false
    },
})

const {step, recipeId} = toRefs(props)
const stepItems = computed(() => step.value.getStepItems())

const store = useTasteBuddyStore()
const startTimer = () => {
    store.setTimer(step?.value?.duration, recipeId?.value)
}
</script>

<style>
.item-highlight {
    font-weight: bold;
    color: var(--ion-color-primary);
}
</style>

<style scoped>
.recipe-step-index-max {
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-normal);
}
</style>