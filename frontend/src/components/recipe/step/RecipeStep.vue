<template>
    <TwoColumnLayout layout="leftBigger">
        <template #left>
            <IonCard>
                <IonImg :src="step?.imgUrl ?? ''"/>
                <IonCardHeader>
                    <IonCardTitle>
                        <span class="recipe-step-index">{{ stepIndex + 1 }}</span><span
                            class="recipe-step-index-max"> / {{ maxStepIndex }}</span>
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
        <template v-if="items.length > 0" #right>
            <IonCard>
                <ItemList :disable-click="true" :items="items"/>
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
import {computed, defineComponent, PropType, toRefs} from "vue";
import {Step} from "@/tastebuddy";
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
        },
        maxStepIndex: {
            type: Number,
            default: 0
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
    setup(props: { step: Step }) {
        const {step} = toRefs(props)

        const items = computed(() => step.value?.getItems() ?? [])
        return {
            items
        }
    }
})
</script>

<style scoped>
.recipe-step-index {
    font-size: 1.5rem;
    font-weight: bold;
}

.recipe-step-index-max {
    font-size: 1.1rem;
}
</style>