<template>
    <div class="recipe-preview-card">
        <RecipeHero :additional-tags="additionalTags" :recipe="recipe" :routable="true"/>

        <TwoColumnLayout size="12" size-lg="6">
            <template v-if="possessedItems.length > 0" #left>
                <IonCard class="no-border">
                    <IonCardHeader>
                        <IonCardTitle>
                            <h2>
                                Ingredients and tools you might have
                            </h2>
                        </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <ItemList key="ingredient" :items="possessedItems ?? []"/>
                    </IonCardContent>
                </IonCard>
            </template>
            <template v-if="missingItems.length > 0" #right>
                <IonCard class="no-border">
                    <IonCardHeader>
                        <IonCardTitle>
                            <h2>
                                What you'll eventually need
                            </h2>
                        </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <ItemList key="tool" :items="missingItems ?? []"/>
                    </IonCardContent>
                </IonCard>
            </template>
        </TwoColumnLayout>
    </div>
</template>

<script lang="ts">
import {computed, defineComponent, PropType, toRefs} from "vue";
import {Item, Recipe, RecipeSuggestion, StepItem} from "@/tastebuddy";
import {IonCard, IonCardContent, IonCardHeader, IonCardTitle, useIonRouter} from "@ionic/vue";
import ItemList from "@/components/recipe/ItemList.vue";
import RecipeHero from "@/components/recipe/RecipeHero.vue";
import TwoColumnLayout from "@/components/layout/TwoColumnLayout.vue";

export default defineComponent({
    name: 'RecipeSuggestionPreview',
    components: {
        IonCardTitle, IonCard, IonCardHeader, IonCardContent,
        TwoColumnLayout,
        RecipeHero,
        ItemList,
    },
    props: {
        recipeSuggestion: {
            type: Object as PropType<RecipeSuggestion>,
            required: true
        }
    },
    setup(props: { recipeSuggestion: RecipeSuggestion }) {
        const {recipeSuggestion} = toRefs(props)
        const recipe = computed<Recipe>(() => recipeSuggestion.value?.recipe ?? new Recipe())
        const missingItems = computed<StepItem[]>(() => recipeSuggestion.value?.getMissingItems() ?? [])
        const possessedItems = computed<Item[]>(() => {
            const missingItemIds = missingItems.value.map(item => item.getId())
            return recipe.value.getStepItems().filter(item => !missingItemIds.includes(item.getId()))
        })
        const additionalTags = computed<string[]>(() => [
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
    border: var(--border);
    border-radius: var(--border-radius);
    cursor: pointer;
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