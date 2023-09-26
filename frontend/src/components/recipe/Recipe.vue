<template>
    <div class="recipe-wrapper">
        <div class="recipe-header ion-margin-bottom">
            <div class="recipe-header-text-wrapper">
                <div class="recipe-title">
                    <h1>{{ name }}</h1>
                    <h2 v-if="authors.length > 0" class="subheader">By {{ authors }}</h2>
                </div>
                <IonButtons>
                    <IonButton v-if="canShareRecipe" aria-valuetext="Share Recipe" @click="shareRecipe()">
                        <IonIcon :icon="shareSocial"/>
                    </IonButton>
                    <IonButton aria-valuetext="Like Recipe" @click="recipe?.toggleLike()">
                        <IonIcon :icon="recipe?.liked ?? false ? heart: heartOutline"
                                 :color="recipe?.liked ?? false ? 'favorite' : undefined "/>
                    </IonButton>
                    <!-- Editor -->
                    <IonButton v-if="isDevMode" aria-valuetext="Edit Recipe" @click="editRecipe">
                        <IonIcon :icon="pencil"/>
                    </IonButton>
                </IonButtons>
                <div class="recipe-tags ion-margin-bottom">
                    <IonChip v-for="tag in recipe?.getTags()" :key="tag" outline>
                        {{ tag }}
                    </IonChip>
                </div>
                <IonText class="recipe-description ion-margin-top">
                    <ReadMore :text="recipe?.getDescription()"/>
                </IonText>
            </div>
            <div class="recipe-image-wrapper">
                <IonImg class="recipe-image" :src="recipe?.props?.imgUrl" alt="Header Image"/>
            </div>
        </div>

        <TwoColumnLayout layout="rightBigger">
            <template #left>
                <div class="sticky">
                    <h2>Ingredients</h2>
                    <TwoColumnLayout v-if="itemsFromRecipe.length > 0" size="12" size-lg="6">
                        <template #left>
                            <IonCard>
                                <IonCardContent>
                                    <IonItem lines="none" color="light" class="recipe-servings">
                                        <IonButtons slot="start">
                                            <IonButton :disabled="servings == 100" @click="servings++">
                                                <IonIcon :icon="add"/>
                                            </IonButton>
                                            <IonButton :disabled="servings == 1" @click="servings--">
                                                <IonIcon :icon="remove"/>
                                            </IonButton>
                                        </IonButtons>
                                        <IonLabel>
                                            {{ servings }} Servings
                                        </IonLabel>
                                    </IonItem>
                                    <ItemList :disable-click="true" :items="itemsFromRecipe"
                                              :type="['ingredient']"/>
                                </IonCardContent>
                            </IonCard>
                        </template>
                        <template v-if="amountTools !== 0" #right>
                            <IonCard>
                                <IonCardContent>
                                    <ItemList :disable-click="true" :items="itemsFromRecipe" :type="['tool']"/>
                                </IonCardContent>
                            </IonCard>
                        </template>
                    </TwoColumnLayout>
                </div>
            </template>

            <template #right>
                <h2>Directions</h2>
                <template v-for="(step, stepIndex) in steps" :key="stepIndex">
                    <IonCard>
                        <IonImg :src="step?.imgUrl ?? ''"/>
                        <IonCardHeader>
                            <IonCardTitle>
                                <h3>
                                    <span class="recipe-step-index">{{ stepIndex + 1 }}</span><span
                                        class="recipe-step-index-max"> / {{ steps.length }}</span>
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
                                <ItemList :disable-click="true" :horizontal="true" :items="step.getStepItems()"/>
                            </IonItem>
                            <IonItem lines="none">
                                <div v-html="step?.printDescription('item-highlight')"></div>
                            </IonItem>
                        </IonCardContent>
                    </IonCard>
                </template>
            </template>
        </TwoColumnLayout>

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
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonChip,
    IonIcon,
    IonImg,
    IonItem,
    IonLabel,
    IonNote,
    IonText,
    useIonRouter,
} from '@ionic/vue';
import {Recipe, Step, StepItem} from '@/tastebuddy/types';
import ItemList from "@/components/recipe/ItemList.vue";
import TwoColumnLayout from "@/components/layout/TwoColumnLayout.vue";
import {add, flame, heart, heartOutline, pencil, remove, shareSocial, time} from "ionicons/icons";
import {useTasteBuddyStore} from "@/storage";
import {CanShareResult, Share} from "@capacitor/share";
import ReadMore from "@/components/utility/ReadMore.vue";

/* Recipe */
const props = defineProps({
    recipe: {
        type: Object as PropType<Recipe>,
        required: true,
    },
});
const {recipe} = toRefs(props);
const authors = computed(() => recipe?.value?.getAuthors() ?? '');
const name = computed(() => recipe?.value?.getName() ?? '');

const itemsFromRecipe: ComputedRef<StepItem[]> = computed(() => recipe?.value?.getStepItems() ?? []);
const amountIngredients = computed(() => itemsFromRecipe.value.reduce((acc, item) => acc + (item.type === 'ingredient' ? 1 : 0), 0))
const amountTools = computed(() => itemsFromRecipe.value.reduce((acc, item) => acc + (item.type === 'tool' ? 1 : 0), 0))
const steps: ComputedRef<Step[]> = computed(() => recipe?.value?.steps ?? [])

// Source
const source = computed(() => {
    const source = recipe?.value?.src?.url
    const sourceTag = source ? `<a href="${source}" target="_blank">${source}</a>` : ''

    if (authors.value !== '' && source !== '') {
        return `Recipe by ${authors.value} on ${sourceTag}`
    } else if (source === '') {
        return `Recipe by ${authors.value}`
    } else if (authors.value === '') {
        return `Recipe on ${sourceTag}`
    } else {
        return ''
    }
})

// Servings
const servings = ref(1)
watch(servings, (newServings, oldServings) => {
    if (newServings !== oldServings) {
        recipe?.value?.updateServings(newServings);
    }
});

/* Segments */
const selectedView = ref('ingredients')

/* Share */
const shareRecipe = () => recipe?.value?.share();
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
        router.push({name: 'RecipeEditor', params: {id: recipe?.value.getId()}})
    }
}
</script>

<style>
.item-highlight {
    font-weight: bold;
    color: var(--ion-color-primary);
}
</style>

<style scoped>
.recipe-wrapper {
    width: 100%;
}

.recipe-description {
    white-space: pre-wrap;
    font-size: var(--font-size-smaller);
    color: var(--ion-color-medium);
    line-height: 150%;
    overflow-y: auto;
    max-height: 250px;
}

.recipe-header {
    display: flex;
    align-items: center;
}

.recipe-image-wrapper {
    flex: 1;
    width: 100%;
}

.recipe-image::part(image) {
    max-width: 400px;
    height: auto;
    border-radius: var(--border-radius);
    margin: auto;
}

.recipe-header-text-wrapper {
    flex: 2;
    margin: 0 var(--margin) 0 0;
}

.recipe-title {
    font-size: 1.5rem;
    font-weight: bold;
}

.recipe-tags {
    margin-top: var(--margin);
}

@media (max-width: 736px) {
    .recipe-header {
        flex-direction: column;
        display: flex;
        align-items: flex-start;
    }

    .recipe-header-text-wrapper {
        margin-bottom: var(--margin-medium);
    }

    .recipe-image-wrapper {
        justify-content: center;
    }
}

.recipe-servings {
    --border-radius: 15px;
}

.recipe-step-index-max {
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-normal);
}
</style>