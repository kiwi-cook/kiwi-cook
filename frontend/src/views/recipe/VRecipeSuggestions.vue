<template>
    <IonPage id="recipe-list-page">

        <IonContent :fullscreen="true">
            <div class="page">
                <div class="content">
                    <FancyHeader :header="['Discover', 'new recipes']"/>
                    <Searchbar v-model="filterInput" :filtered-items="filteredItems" class="item-searchbar"
                               placeholder="What ingredients are you craving today?"
                               @select="selectItem($event)"/>

                    <!-- Favorite recipes -->
                    <List v-if="favoriteRecipes.length > 0" :list="favoriteRecipes" :horizontal="true" :load-all="true"
                          :no-wrap="true">
                        <template #element="{ element }">
                            <div class="mini-recipe-preview">
                                <MiniRecipePreview :recipe="element as Recipe"/>
                            </div>
                        </template>
                    </List>

                    <!-- Suggested items -->
                    <ItemList v-if="suggestedItems.length > 0" :horizontal="true" :items="suggestedItems"
                              :item-border="true" @select="selectItem($event)"/>

                    <IonCard>
                        <IonCardHeader>
                            <IonCardSubtitle>
                                Select the ingredients and tools you want to use
                            </IonCardSubtitle>
                            <IonCardTitle>
                                <h2>
                                    Your ingredients and tools
                                </h2>
                            </IonCardTitle>

                        </IonCardHeader>

                        <IonCardContent>
                            <ItemList :items="selectedItems" @select="selectItem($event)"/>
                        </IonCardContent>
                    </IonCard>

                    <IonCard v-show="selectedItems.length > 0" class="animation-fade-in">
                        <IonCardHeader>
                            <IonCardSubtitle>
                                Select the maximum cooking time
                            </IonCardSubtitle>
                            <IonCardTitle>
                                <h2>
                                    How long do you want to spend cooking?
                                </h2>
                            </IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <template v-for="time in cookingTimes" :key="time">
                                <IonChip :outline="true" class="cooking-time"
                                         @click="maxCookingTime = time">
                                    {{ time }} min.
                                </IonChip>
                            </template>
                            <IonRange v-model="maxCookingTime" :label="`${maxCookingTime} minutes max. cooking time`"
                                      :max="60" :min="5" :pin="true" :pin-formatter="(value: number) => `${value} min.`"
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

                    <IonCard v-if="recipeSuggestions.length > 0 && submitted">
                        <IonCardHeader>
                            <IonCardTitle>
                                <h2>
                                    Explore {{ recipeSuggestions.length }} recipes
                                </h2>
                            </IonCardTitle>
                        </IonCardHeader>
                        <List :list="recipeSuggestions">
                            <template #element="{ element }">
                                <RecipeSuggestionPreview :recipe-suggestion="element as RecipeSuggestion"/>
                            </template>
                        </List>
                    </IonCard>
                    <IonCard v-else-if="submitted">
                        <IonCardHeader>
                            <IonCardTitle>
                                <h2>
                                    No recipes found
                                </h2>
                            </IonCardTitle>
                        </IonCardHeader>
                    </IonCard>

                    <IonCard v-if="recipeSuggestions.length > 0">
                        <IonCardHeader>
                            <IonCardTitle>More Recipes</IonCardTitle>
                        </IonCardHeader>
                        <List :list="moreRecipes">
                            <template #element="{ element }">
                                <RecipePreview :recipe="element as Recipe"/>
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
    IonChip,
    IonContent,
    IonPage,
    IonRange,
} from '@ionic/vue';
import {useRecipeStore} from '@/storage';
import {Item, Recipe, RecipeSuggestion, SearchQueryBuilder, suggestRecipes} from '@/tastebuddy';
import List from "@/components/recipe/List.vue";
import RecipePreview from "@/components/recipe/previews/RecipePreview.vue";
import RecipeSuggestionPreview from "@/components/recipe/previews/RecipeSuggestionPreview.vue";
import Searchbar from "@/components/utility/Searchbar.vue";
import ItemList from "@/components/recipe/ItemList.vue";
import FancyHeader from "@/components/utility/FancyHeader.vue";
import MiniRecipePreview from "@/components/recipe/previews/MiniRecipePreview.vue";

export default defineComponent({
    name: 'RecipeSuggestionsPage',
    computed: {
        Recipe() {
            return Recipe
        }
    },
    components: {
        MiniRecipePreview,
        FancyHeader,
        ItemList,
        Searchbar,
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
        IonRange,
        IonChip
    },
    setup() {
        const recipeStore = useRecipeStore()

        const itemsById = computed(() => recipeStore.getItemsAsMap)
        const items: ComputedRef<Item[]> = computed(() => Object.values(itemsById.value ?? {}))

        /* Filtered items */
        const filteredItems = ref([] as Item[])
        const filterInput = ref('')
        watch([filterInput, items], () => {
            if (filterInput.value === '') {
                filteredItems.value = []
            } else {
                filteredItems.value = (items.value ?? [])
                    .filter((item: Item) => item.getName()
                        .toLowerCase().includes((filterInput.value ?? '').toLowerCase()))
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

        /* City */
        const city = ref('')

        /* Max cooking time */
        const maxCookingTime = ref(15)
        const cookingTimes = [5, 15, 30, 60]

        /* Recipes suggestions */
        const recipeSuggestions: Ref<RecipeSuggestion[]> = ref([])

        /* Suggest recipes */
        const suggest = () => {
            const searchQueryBuilder = new SearchQueryBuilder()
            searchQueryBuilder.setCity(city.value)
            searchQueryBuilder.setDuration(maxCookingTime.value)
            searchQueryBuilder.setItemIds(Array.from(selectedItemIds))
            const query = searchQueryBuilder.build()
            recipeSuggestions.value = suggestRecipes(query)
        }

        /* Submit button */
        const submitted = ref(false)
        const submit = () => {
            if (recipeSuggestions.value.length === 0) {
                // suggest recipes
                submitted.value = true
                suggest()
            } else {
                // reset
                submitted.value = false
                recipeSuggestions.value = []
            }
        }
        const submitButton = computed<string>(() => recipeSuggestions.value.length === 0 ? 'Suggest Recipes' : 'Reset');
        const submitColor = computed<string>(() => recipeSuggestions.value.length === 0 ? 'primary' : 'danger');
        const submitDisabled = computed<boolean>(() => recipeSuggestions.value.length === 0
            && selectedItems.value.length === 0)

        /* Favorite recipes */
        const favoriteRecipes: ComputedRef<Recipe[]> = computed(() => recipeStore.getSavedRecipes.slice(0, 8))

        /* Items suggestions */
        const recipes = computed(() => recipeStore.getRecipesAsList)
        const suggestedItems: Ref<Item[]> = computed(() => {
                const randItems = recipes.value.flatMap((recipe: Recipe) => recipe.getItems())
                    .filter(() => Math.random() < 0.5)
                    .slice(0, 3)
                const favItems = favoriteRecipes.value.flatMap((recipe: Recipe) => recipe.getItems())
                    .filter(() => Math.random() < 0.5)
                    .slice(0, 3)
                console.log(randItems, favItems)
                return [...new Set([...randItems, ...favItems])].slice(0, 6)
            }
        )

        /* Recipes */
        const moreRecipes = computed(() => recipeStore.getRecipesAsList
            .filter((recipe: Recipe) => recipeSuggestions.value
                .every((suggestion: RecipeSuggestion) => suggestion.getRecipe().getId() !== recipe.getId())))

        return {
            /* Filtering */
            filterInput,
            selectItem, filteredItems, selectedItems,
            city,
            /* Cooking Time */
            maxCookingTime, cookingTimes,
            /* Submit */
            submit, submitButton, submitColor, submitDisabled, submitted,
            /* Suggestions */
            RecipeSuggestion, recipeSuggestions,
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

.item-searchbar {
    margin-bottom: 1rem;
}

.cooking-time {
    cursor: pointer;
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