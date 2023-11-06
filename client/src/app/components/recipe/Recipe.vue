<template>
    <div class="recipe-wrapper">
        <div class="recipe-header ion-margin-bottom">
            <div class="recipe-header-text-wrapper">
                <RecipeTitle :recipe="recipe" disable-link title="Let's start cooking!"/>
                <IonButtons>
                    <IonButton v-if="canShareRecipe" aria-valuetext="Share Recipe" @click="shareRecipe()">
                        <IonIcon :icon="shareSocial"/>
                    </IonButton>
                    <IonButton aria-valuetext="Like Recipe" @click="toggleSave()">
                        <IonIcon :color="isSaved ?? false ? 'favorite' : undefined "
                                 :icon="isSaved ?? false ? heart: heartOutline"/>
                    </IonButton>
                </IonButtons>
                <div class="recipe-tags ion-margin-bottom">
                    <IonChip v-for="tag in recipe?.getTags()" :key="tag" outline>
                        {{ tag }}
                    </IonChip>
                </div>
                <IonText class="recipe-description desc ion-margin-top">
                    <ReadMore :text="recipe?.getDescription()"/>
                </IonText>
            </div>
            <div class="recipe-image-wrapper">
                <IonImg :src="recipe?.props?.imgUrl" alt="Header Image" class="recipe-image"/>
            </div>
        </div>

        <TwoColumnLayout layout="rightBigger">
            <template v-if="ingredients.length > 0 || tools.length > 0" #left>
                <div class="sticky">
                    <div class="header">
                        <h2>{{ itemsFromRecipe.length }} {{ $t('Recipe.Ingredient', itemsFromRecipe.length) }}</h2>
                    </div>
                    <IonCard v-if="ingredients.length > 0">
                        <IonCardContent>
                            <IonItem class="recipe-servings" color="light" lines="none">
                                <IonLabel>{{ $t('Recipe.Serving', servings) }}</IonLabel>
                                <div class="recipe-servings-button">
                                    <IonButton :disabled="servings === 1" color="light" @click="servings--">
                                        <IonIcon :icon="remove"/>
                                    </IonButton>
                                    {{ servings }}
                                    <IonButton :disabled="servings === 100" color="light" @click="servings++">
                                        <IonIcon :icon="add"/>
                                    </IonButton>
                                </div>
                            </IonItem>
                            <ItemList :items="ingredients"/>
                        </IonCardContent>
                    </IonCard>
                    <IonCard v-if="tools.length > 0">
                        <IonCardContent>
                            <ItemList :items="tools"/>
                        </IonCardContent>
                    </IonCard>
                </div>
            </template>

            <template #right>
                <div class="header">
                    <h2>{{ steps.length }} {{ $t('Recipe.Direction', steps.length) }}
                    </h2>
                    <Duration :duration="recipe?.getDuration()"/>
                </div>
                <template v-for="(step, stepIndex) in [...steps]" :key="stepIndex">
                    <StepComponent :amount-steps="steps.length" :recipe-id="recipe?.getId()" :step="step"
                                   :step-index="stepIndex"/>
                </template>
                <!-- if no steps are available, don't show the good appetite message -->
                <StepComponent v-if="steps.length > 0" :step="goodAppetiteStep"/>
            </template>
        </TwoColumnLayout>

        <IonItem lines="none">
            <IonNote>
                <p v-html="source"/>
            </IonNote>
        </IonItem>
    </div>
</template>

<script lang="ts" setup>
import {computed, PropType, ref, toRefs, watch} from 'vue';
import {
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonChip,
    IonIcon,
    IonImg,
    IonItem,
    IonLabel,
    IonNote,
    IonText,
} from '@ionic/vue';
import {Recipe, Step, STEP_TYPES, StepItem} from '@/shared/ts';
import ItemList from '@/shared/components/utility/list/ItemList.vue';
import StepComponent from '@/app/components/recipe/Step.vue';
import TwoColumnLayout from '@/app/components/layout/TwoColumnLayout.vue';
import {add, heart, heartOutline, remove, shareSocial} from 'ionicons/icons';
import {CanShareResult, Share} from '@capacitor/share';
import ReadMore from '@/shared/components/utility/ReadMore.vue';
import {useI18n} from 'vue-i18n';
import RecipeTitle from '@/app/components/recipe/RecipeTitle.vue';
import {useRecipeStore} from '@/app/storage';
import Duration from '@/shared/components/recipe/chip/Duration.vue';

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
const store = useRecipeStore();
const isSaved = computed(() => store.getSavedRecipesIds.includes(recipe?.value?.getId()));
const toggleSave = () => store.setSaved(recipe?.value);

const itemsFromRecipe = computed<StepItem[]>(() => recipe?.value?.getStepItems() ?? []);
const ingredients = computed<StepItem[]>(() => itemsFromRecipe.value.filter((item: StepItem) => item.type === 'ingredient'))
const tools = computed<StepItem[]>(() => itemsFromRecipe.value.filter((item: StepItem) => item.type === 'tool'))
const steps = computed<Step[]>(() => recipe?.value?.steps ?? [])

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

// i18n
const {t} = useI18n()

// Good Appetite Step
const goodAppetiteStep = new Step()
goodAppetiteStep.type = STEP_TYPES.HEADER
goodAppetiteStep.setDescription(t('Recipe.GoodAppetite'))

/* Share */
const shareRecipe = () => recipe?.value?.share();
// check if the browser supports sharing
const canShareRecipe = ref(false);
Share.canShare().then((canShareResult: CanShareResult) => {
    canShareRecipe.value = canShareResult.value;
})
</script>


<style scoped>
.recipe-wrapper {
    width: 100%;
}

.recipe-description {
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

.recipe-title-wrapper {
    font-size: 1.5rem;
    font-weight: bold;
}

.recipe-title {
    font-family: var(--font-special);
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
    margin-bottom: var(--margin);
}

.recipe-servings-button {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.header {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
</style>