<template>
    <div class="recipe-wrapper">
        <div class="recipe-header">
            <div class="recipe-title">
                <h1>{{ recipe?.getName() }}</h1>
                <h2 class="subheader">By {{ recipe?.getAuthors() }}</h2>
                <IonButtons>
                    <IonButton v-if="canShareRecipe" aria-valuetext="Share Recipe" @click="shareRecipe()">
                        <IonIcon :icon="shareSocial"/>
                    </IonButton>
                    <IonButton aria-valuetext="Like Recipe" @click="recipe?.toggleLike()">
                        <IonIcon :icon="recipe.isLiked ?? false ? heart: heartOutline"
                                 :color="recipe.isLiked ?? false ? 'primary' : undefined "/>
                    </IonButton>
                    <!-- Editor -->
                    <IonButton v-if="isDevMode" aria-valuetext="Edit Recipe" @click="editRecipe">
                        <IonIcon :icon="pencil"/>
                    </IonButton>
                </IonButtons>
            </div>
            <div class="recipe-image-wrapper">
                <IonImg class="recipe-image" :src="recipe.props.imgUrl" alt="Header Image"/>
            </div>
        </div>

        <IonAccordionGroup :multiple="true" :value="['description', 'items', 'steps']" expand="inset"
                           class="recipe-categories">
            <IonAccordion value="description">
                <IonItem slot="header">
                    <h2>Description</h2>
                </IonItem>
                <div slot="content" class="ion-padding">
                    <IonText class="recipe-description">
                        <p>
                            {{ recipe?.getDescription() }}
                        </p>
                    </IonText>
                </div>
            </IonAccordion>

            <IonAccordion value="items">
                <IonItem slot="header">
                    <h2>What you'll need</h2>
                </IonItem>
                <div slot="content" class="ion-padding">
                    <TwoColumnLayout v-if="itemsFromRecipe.length > 0" size="12" size-lg="6">
                        <template #left>
                            <IonCard>
                                <IonCardContent>
                                    <IonItem class="servings-counter" lines="none">
                                        <IonInput v-model="servings" label="Servings" label-placement="end" max="15"
                                                  min="1"
                                                  type="number"/>
                                    </IonItem>
                                    <ItemList :disable-click="true" :items="itemsFromRecipe" :type="['ingredient']"/>
                                </IonCardContent>
                            </IonCard>
                        </template>
                        <template #right>
                            <IonCard v-if="amountTools !== 0">
                                <IonCardContent>
                                    <ItemList :disable-click="true" :items="itemsFromRecipe" :type="['tool']"/>
                                </IonCardContent>
                            </IonCard>
                        </template>
                    </TwoColumnLayout>
                </div>
            </IonAccordion>

            <IonAccordion value="steps">
                <IonItem slot="header">
                    <h2>How to make it</h2>
                </IonItem>
                <div slot="content" class="ion-padding">
                    <template v-for="(step, stepIndex) in steps" :key="stepIndex">
                        <IonCard>
                            <IonImg :src="step?.imgUrl ?? ''"/>
                            <IonCardHeader>
                                <IonCardTitle>
                                    <span class="recipe-step-index">{{ stepIndex + 1 }}</span><span
                                        class="recipe-step-index-max"> / {{ steps.length }}</span>
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
                                <ItemList :disable-click="true" :horizontal="true" :items="step.getStepItems()"/>
                                <IonItem lines="none">
                                    <div v-html="step?.printDescription('item-highlight')"></div>
                                </IonItem>
                            </IonCardContent>
                        </IonCard>
                    </template>
                </div>
            </IonAccordion>
        </IonAccordionGroup>

        <IonItem lines="none">
            <IonNote>
                <p v-html="source"/>
            </IonNote>
        </IonItem>
    </div>
</template>

<script setup lang="ts">
import {computed, ComputedRef, PropType, ref, toRefs, watch} from 'vue';
import {
    IonAccordion,
    IonAccordionGroup,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonChip,
    IonIcon,
    IonImg,
    IonInput,
    IonItem,
    IonLabel,
    IonNote,
    IonText,
    useIonRouter,
} from '@ionic/vue';
import {Recipe, Step, StepItem} from '@/tastebuddy/types';
import ItemList from "@/components/recipe/ItemList.vue";
import TwoColumnLayout from "@/components/layout/TwoColumnLayout.vue";
import {flame, heart, heartOutline, pencil, shareSocial, time} from "ionicons/icons";
import {useTasteBuddyStore} from "@/storage";
import {CanShareResult, Share} from "@capacitor/share";

const props = defineProps({
    recipe: {
        type: Object as PropType<Recipe>,
        required: true,
    },
});
const {recipe} = toRefs(props);

const itemsFromRecipe: ComputedRef<StepItem[]> = computed(() => recipe.value?.getStepItems() ?? []);
const amountIngredients = computed(() => itemsFromRecipe.value.reduce((acc, item) => acc + (item.type === 'ingredient' ? 1 : 0), 0))
const amountTools = computed(() => itemsFromRecipe.value.reduce((acc, item) => acc + (item.type === 'tool' ? 1 : 0), 0))
const steps: ComputedRef<Step[]> = computed(() => recipe.value?.steps ?? [])

// Source
const source = computed(() => {
    const authors = recipe.value?.getAuthors()
    const source = recipe.value?.source?.url
    const sourceTag = source ? `<a href="${source}" target="_blank">${source}</a>` : ''

    if (authors !== '' && source !== '') {
        return `Recipe by ${authors} on ${sourceTag}`
    } else if (source === '') {
        return `Recipe by ${authors}`
    } else if (authors === '') {
        return `Recipe on ${sourceTag}`
    } else {
        return ''
    }
})

// Servings
const servings = ref(1)
watch(servings, (newServings, oldServings) => {
    if (newServings !== oldServings) {
        recipe.value?.updateServings(newServings);
    }
});

/* Share */
const shareRecipe = () => recipe.value?.share();
// check if the browser supports sharing
const canShareRecipe = ref(false);
Share.canShare().then((canShareResult: CanShareResult) => {
    canShareRecipe.value = canShareResult.value;
})

/* Editor */
const tasteBuddyStore = useTasteBuddyStore()
const router = useIonRouter()
const isDevMode = computed(() => tasteBuddyStore.isDevMode)
const editRecipe = () => {
    if (isDevMode.value) {
        router.push({name: 'RecipeEditor', params: {id: recipe.value.getId()}})
    }
}
</script>

<style scoped>
.recipe-wrapper {
    width: 100%;
}

.recipe-categories {
    margin-left: 0;
    margin-right: 0;
}

.recipe-description {
    white-space: pre-wrap;
    color: var(--ion-color-medium);
    font-size: var(--font-size-small);
}

.servings-counter {
    max-width: 150px;
}

.recipe-header {
    display: flex;
    align-items: center;
}

.recipe-image-wrapper {
    flex: 1;
}

.recipe-image::part(image) {
    max-width: 100%;
    height: auto;
    border-radius: var(--border-radius);
}

.recipe-title {
    flex: 2;
    font-size: 1.5rem;
    font-weight: bold;
    margin: 0;
}

@media (max-width: 768px) {
    .recipe-header {
        flex-direction: column;
        display: flex;
        align-items: flex-start;
    }

    .recipe-title {
        margin-bottom: var(--margin-medium);
    }
}

@media (min-width: 768px) {
    .recipe-image-wrapper {
        display: block;
    }

    .recipe-title {
        margin-right: 20px;
    }
}
</style>