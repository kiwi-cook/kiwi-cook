<template>
    <IonCard class="recipe-preview-card" @click="toRecipe()">
        <RecipeHero :recipe="recipe" :additional-tags="additionalTags" class="recipe-preview-hero"/>
        <IonCardContent>
            <IonCardHeader>
                <IonCardTitle color="primary">Ingredients and Tools</IonCardTitle>
            </IonCardHeader>
            <TwoColumnLayout>
                <template #left>
                    <ItemList key="ingredient" :items="possessedItems ?? []" />
                </template>
                <template #right>
                    <ItemList key="tool" :items="missingItems ?? []"/>
                </template>
            </TwoColumnLayout>
            <RecipeLink :recipe="recipe">
                View Full Recipe
            </RecipeLink>
        </IonCardContent>
    </IonCard>
</template>

<script lang="ts">
import {computed, ComputedRef, defineComponent, PropType, toRefs} from "vue";
import {Item, Recipe, RecipeSuggestion} from "@/tastebuddy/types";
import {IonCard, IonCardContent, IonCardTitle, useIonRouter} from "@ionic/vue";
import RecipeLink from "@/components/recipe/RecipeLink.vue";
import ItemList from "@/components/recipe/ItemList.vue";
import RecipeHero from "@/components/recipe/RecipeHero.vue";
import TwoColumnLayout from "@/components/layout/TwoColumnLayout.vue";

export default defineComponent({
    name: 'RecipeSuggestionPreview',
    components: {TwoColumnLayout, RecipeHero, ItemList, RecipeLink, IonCard, IonCardContent, IonCardTitle},
    props: {
        recipeSuggestion: {
            type: Object as PropType<RecipeSuggestion>,
            required: true
        }
    },
    setup(props: { recipeSuggestion: RecipeSuggestion }) {
        const {recipeSuggestion} = toRefs(props)
        const recipe: ComputedRef<Recipe> = computed(() => recipeSuggestion.value?.recipe ?? new Recipe())
        const missingItems: ComputedRef<Item[]> = computed(() => recipeSuggestion.value?.getMissingItems() ?? [])
        const possessedItems: ComputedRef<Item[]> = computed(() => {
            const missingItemIds = missingItems.value.map(item => item.getId())
            return recipe.value.getItems().filter(item => !missingItemIds.includes(item.getId()))
        })
        const additionalTags = computed(() => [
            (recipeSuggestion.value.recipe_price ?? 0) + ' €'
        ])

        const router = useIonRouter();
        const toRecipe = () => {
            router.push({name: 'Recipe', params: {id: recipe.value?.getId()}})
        }

        return {
            recipe, missingItems, possessedItems, additionalTags,
            toRecipe
        }
    }
});
</script>

<!-- Use this to override the default styles -->
<style>
/* Override hero styles */
.recipe-preview-hero {
    height: 400px;
    border-radius: 0;
}

/* Is used in the RecipeHero component */
.recipe-preview-hero .hero-image::part(image) {
    border-radius: 0;
}
</style>

<style scoped>
.recipe-preview-card {
    --color: var(--ion-color-dark);
    --border-radius: 8px;
    --box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
    --padding: 16px;
    --margin: 16px;
    --ion-button-color: #FFF;
    --ion-button-background-color: #F28705;
    cursor: pointer;
}

.recipe-step-preview {
    margin-top: 16px;
    color: var(--ion-color-light);
}

.recipe-preview-card ion-card-content {
    padding: var(--padding);
}

.recipe-preview-card ion-card-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--ion-button-background-color);
}

.recipe-preview-card p {
    margin-top: 16px;
    font-size: 16px;
    line-height: 1.5;
}

.recipe-preview-card ion-button {
    margin-top: 16px;
    border-radius: 999px;
    text-transform: uppercase;
    font-weight: 600;
    --background: var(--ion-button-background-color);
    --color: var(--ion-button-color);
}
</style>