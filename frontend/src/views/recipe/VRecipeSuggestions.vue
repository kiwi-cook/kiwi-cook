<template>
    <IonPage id="recipe-list-page">

        <IonContent :fullscreen="true">
            <div class="page">
                <div class="content">
                    <h1 >
                        Discover new recipes
                    </h1>
                    <ItemSearchbar v-model="filterInput" :filtered-items="filteredItems"
                                   placeholder="What ingredients are you craving today?"
                                   @select="selectItem($event)">
                    </ItemSearchbar>

                    <!-- <List v-if="favoriteRecipes.length > 0" :item-list="favoriteRecipes">
                        <template #item="{ item }">
                            <div class="mini-recipe-preview">
                                <RecipePreview :no-description="true" :recipe="(item as Recipe)"/>
                            </div>
                        </template>
                    </List> -->

                    <ItemList v-if="suggestedItems.length > 0" :horizontal="true" :items="suggestedItems"
                              @select="selectItem($event)"/>

                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>
                                <h2 >
                                    Your ingredients
                                </h2>
                            </IonCardTitle>
                            <IonCardSubtitle>
                                Select the ingredients you want to use
                            </IonCardSubtitle>

                        </IonCardHeader>

                        <IonCardContent>
                            <ItemList :items="selectedItems" @select="selectItem($event)"/>
                        </IonCardContent>
                    </IonCard>

                    <!-- <IonCard v-if="selectedItems.length > 0">
                        <IonCardHeader>
                            <IonCardSubtitle>
                                Find the best ingredient prices near you!
                            </IonCardSubtitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonInput v-model="city" label="City" label-placement="stacked"
                                      placeholder="Where do you live?"/>
                        </IonCardContent>
                    </IonCard> -->

                    <IonCard v-show="selectedItems.length > 0" class="animation-fade-in">
                        <IonCardHeader>
                            <IonCardTitle>
                                <h2 >
                                    How long do you want to spend cooking?
                                </h2>
                            </IonCardTitle>
                            <IonCardSubtitle>
                                Select the maximum cooking time
                            </IonCardSubtitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonRange v-model="maxCookingTime" :label="`${maxCookingTime} minutes max. cooking time`"
                                      :max="60" :min="5" :pin="true" :pin-formatter="(value: number) => `${value} min`"
                                      :snaps="true"
                                      :step="5" :ticks="false"
                                      label-placement="end"/>
                        </IonCardContent>
                    </IonCard>

                    <div class="center">
                        <IonButton :color="submitColor" :disabled="submitDisabled" class="search-button"
                                   type="submit"
                                   @click="submit()">
                            {{ submitButton }}
                        </IonButton>
                    </div>

                    <IonCard v-if="recipeSuggestions.length > 0">
                        <IonCardHeader>
                            <IonCardTitle>
                                <h2 >
                                    Suggested Recipes
                                </h2>
                            </IonCardTitle>
                        </IonCardHeader>
                        <List :item-list="recipeSuggestions" :no-items-message="noRecipesMessage">
                            <template #item="{ item }">
                                <RecipeSuggestionPreview :recipe-suggestion="item as RecipeSuggestion"/>
                            </template>
                        </List>
                    </IonCard>

                    <IonCard v-if="recipeSuggestions.length > 0">
                        <IonCardHeader>
                            <IonCardTitle>More Recipes</IonCardTitle>
                        </IonCardHeader>
                        <List :item-list="moreRecipes" :no-items-message="noRecipesMessage">
                            <template #item="{ item }">
                                <RecipePreview :recipe="item as Recipe"/>
                            </template>
                        </List>
                    </IonCard>
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts">
import {computed, ComputedRef, defineComponent, Ref, ref, watch} from 'vue';
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonContent,
    IonPage,
    IonRange,
} from '@ionic/vue';
import {useRecipeStore} from '@/storage';
import {Item, Recipe, RecipeSuggestion, StepItem} from '@/tastebuddy/types';
import List from "@/components/utility/List.vue";
import RecipePreview from "@/components/recipe/RecipePreview.vue";
import RecipeSuggestionPreview from "@/components/recipe/RecipeSuggestionPreview.vue";
import ItemSearchbar from "@/components/utility/ItemSearchbar.vue";
import ItemList from "@/components/recipe/ItemList.vue";

export default defineComponent({
    name: 'RecipeSuggestionsPage',
    computed: {
        Recipe() {
            return Recipe
        }
    },
    components: {
        ItemList,
        ItemSearchbar,
        RecipeSuggestionPreview,
        RecipePreview,
        List,
        IonPage,
        IonContent,
        IonCard,
        IonCardHeader,
        IonCardTitle,
        IonCardSubtitle,
        IonCardContent,
        IonButton,
        IonRange
    },
    setup() {
        const enum suggestionStates {
            ITEMS_SELECTED,
            LOCATION,
            COOKING_TIME,
        }

        const store = useRecipeStore()
        const itemsById = computed(() => store.getItemsAsMap)
        const items: ComputedRef<Item[]> = computed(() => Object.values(itemsById.value ?? {}))

        /* Filtered items */
        const filteredItems = ref([] as Item[])
        const filterInput = ref('')
        watch([filterInput, items], () => {
            if (filterInput.value === '') {
                filteredItems.value = []
            } else {
                filteredItems.value = (items.value ?? [])
                    .filter((item: Item) => item.getName().toLowerCase().includes((filterInput.value ?? '').toLowerCase()))
                    .filter((item: Item) => !selectedItemIds.has(item.getId()))
            }
        }, {immediate: true})

        /* Selected items */
        const selectedItemIds = new Set<string>()
        const selectedItems = ref([] as Item[])
        const selectItem = (itemID: string) => {
            if (selectedItemIds.has(itemID)) {
                selectedItemIds.delete(itemID)
            } else {
                filterInput.value = ''
                selectedItemIds.add(itemID)
            }
            selectedItems.value = Array.from(selectedItemIds).map(id => itemsById.value[id])
        }

        /* Recipes suggestions */
        const city = ref('')
        const maxCookingTime = ref(15)
        const recipeSuggestions: Ref<RecipeSuggestion[]> = ref([])
        const suggestRecipes = () => RecipeSuggestion.suggestRecipes(store, Array.from(selectedItemIds), city.value)
            .then((fetchedRecipeSuggestions: RecipeSuggestion[]) => recipeSuggestions.value = fetchedRecipeSuggestions)
        const noRecipesMessage = computed(() => {
            if (selectedItems.value.length === 0) {
                return 'Select items'
            } else {
                return 'No recipes found'
            }
        })

        const submit = () => {
            if (recipeSuggestions.value.length === 0) {
                // suggest recipes
                suggestRecipes()
            } else {
                // reset
                recipeSuggestions.value = []
            }
        }
        const submitButton = computed<string>(() => recipeSuggestions.value.length === 0 ? 'Suggest Recipes' : 'Reset');
        const submitColor = computed<string>(() => recipeSuggestions.value.length === 0 ? 'primary' : 'danger');
        const submitDisabled = computed<boolean>(() => recipeSuggestions.value.length === 0 && selectedItems.value.length === 0)

        /* Favorite recipes */
        const favoriteRecipes: ComputedRef<Recipe[]> = computed(() => store.getSavedRecipes.slice(0, 3))

        /* Items suggestions prototype */
        const suggestedItems: Ref<Item[]> = computed(() => {
                favoriteRecipes.value.slice(0, 3).flatMap((recipe: Recipe) => recipe.getItems() ?? [])
                const itemsFromRecipes = favoriteRecipes.value.flatMap((recipe: Recipe) => (recipe.getItems() ?? [])
                    .map((item: StepItem) => item.narrow(item)))
                const randomItems = items.value.filter(() => Math.random() < 0.8)
                return [...new Set([...itemsFromRecipes, ...randomItems])]
            }
        )

        /* Recipes */
        const moreRecipes = computed(() => store.getRecipesAsList
            .filter((recipe: Recipe) => recipeSuggestions.value
                .every((suggestion: RecipeSuggestion) => suggestion.getRecipe().getId() !== recipe.getId())))

        return {
            /* Filtering */
            filterInput,
            selectItem, filteredItems, selectedItems,
            city, maxCookingTime,
            /* Submit */
            submit, submitButton, submitColor, submitDisabled,
            /* Suggestions */
            RecipeSuggestion, recipeSuggestions, noRecipesMessage,
            favoriteRecipes, suggestedItems,
            /* Recipes */
            moreRecipes
        }
    }
})
;
</script>

<style scoped>
ion-card-title {
    font-size: 1.5rem;
}

.search-button {
    width: 70%;
    max-width: 400px;
}

.mini-recipe-preview {
    width: 100%;
    max-width: 200px;
}
</style>