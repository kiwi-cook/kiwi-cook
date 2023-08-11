<template>
    <IonCard>
        <IonImg :src="step?.imgUrl ?? ''"/>
        <IonCardHeader>
            <IonCardTitle>
                <span class="recipe-step-index">{{ stepIndex + 1 }}</span><span
                    class="recipe-step-index-max"> / {{ maxStepIndex }}</span>
                <IonChip v-if="step?.duration > 0">
                    <IonIcon :icon="time"/>
                    <IonLabel>{{ step?.duration }} min.</IonLabel>
                </IonChip>
                <IonChip v-if="step?.temperature > 0">
                    <IonIcon :icon="flame"/>
                    <IonLabel>{{ step?.temperature }} °C</IonLabel>
                </IonChip>
            </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
            <ItemList :disable-click="true" :horizontal="true" :items="items"/>
            <IonItem lines="none">
                <div v-html="step?.getDescription('item-highlight')"></div>
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
    IonIcon,
    IonImg,
    IonItem,
    IonLabel,
} from '@ionic/vue';
import {computed, defineComponent, PropType, toRefs} from "vue";
import {Step} from "@/tastebuddy";
import ItemList from "@/components/recipe/ItemList.vue";
import {flame, time} from "ionicons/icons";

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
        },
        maxStepIndex: {
            type: Number,
            default: 0
        }
    },
    components: {
        IonIcon,
        ItemList,
        IonCard,
        IonCardHeader,
        IonCardTitle,
        IonCardContent,
        IonItem,
        IonImg,
        IonChip,
        IonLabel,
    },
    setup(props: { step: Step }) {
        const {step} = toRefs(props)

        const items = computed(() => step.value?.getItems() ?? [])
        return {
            // icons
            time, flame,
            // items
            items
        }
    }
})
</script>

<style>
.item-highlight {
    font-weight: bold;
    color: var(--ion-color-secondary);
}
</style>

<style scoped>
.recipe-step-index {
    font-size: 1.5rem;
    font-weight: bold;
}

.recipe-step-index-max {
    font-size: 1.1rem;
}
</style>