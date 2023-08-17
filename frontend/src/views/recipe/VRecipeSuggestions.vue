<template>
    <IonPage id="recipe-list-page">

        <IonContent :fullscreen="true">
            <div class="page">
                <div class="content">
                    <FancyHeader :header="['Discover', 'new recipes']"/>

                    <!-- Searchbar for ingredients and tools -->
                    <Searchbar v-model="filterInput" :elements="filteredItems" class="item-searchbar"
                               placeholder="What ingredients are you craving today?">
                        <template #element="{element}">
                            <ItemComponent :item="element as Item" @click="includeItem((element as Item).getId())"/>
                        </template>
                    </Searchbar>

                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>
                                <h2>
                                    Select the <FancyText text="ingredients and tools" /> you want to use
                                </h2>
                            </IonCardTitle>
                            <IonCardSubtitle>
                                <h3>
                                    Include or exclude by clicking on + and -
                                </h3>
                            </IonCardSubtitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <!-- Suggested and selected items -->
                            <List :list="[...selectedItems, ...itemSuggestions]" :load-all="true">
                                <template #element="{ element }">
                                    <ItemComponent :item="element as Item"
                                                   :color="selectedItemColors[(element as Item).getId()]"
                                                   :disable-click="true">
                                        <template #buttons>
                                            <IonButton
                                                :color="itemQueries[(element as Item).getId()] === false ? 'success' : 'light'"
                                                aria-description="Include item"
                                                @click="includeItem((element as Item).getId())">
                                                <IonIcon :icon="includeIcon"/>
                                            </IonButton>
                                            <IonButton
                                                :color="itemQueries[(element as Item).getId()] ? 'danger' : 'light'"
                                                aria-description="Exclude item"
                                                @click="excludeItem((element as Item).getId())">
                                                <IonIcon :icon="excludeIcon"/>
                                            </IonButton>
                                            <IonButton
                                                v-if="typeof itemQueries[(element as Item).getId()] !== 'undefined'"
                                                color="light"
                                                aria-description="Remove item"
                                                @click="removeItem((element as Item).getId())">
                                                <IonIcon :icon="removeIcon"
                                                         @click="removeItem((element as Item).getId())"/>
                                            </IonButton>
                                        </template>
                                    </ItemComponent>
                                </template>
                            </List>
                        </IonCardContent>
                    </IonCard>


                    <!-- Favorite recipes -->
                    <List v-if="suggestedRecipes.length > 0" :list="suggestedRecipes" :horizontal="true"
                          :load-all="true"
                          :no-wrap="true">
                        <template #element="{ element }">
                            <div class="mini-recipe-preview">
                                <MiniRecipePreview :recipe="element as Recipe"/>
                            </div>
                        </template>
                    </List>

                    <IonCard v-show="selectedItems.length > 0">
                        <IonCardHeader>
                            <IonCardSubtitle>
                                <h3>
                                    Select the maximum cooking time
                                </h3>
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

                    <template v-if="recipeSuggestions.length > 0 && submitted">
                        <h2>
                            Explore {{ recipeSuggestions.length }} recipes
                        </h2>
                        <List :list="recipeSuggestions">
                            <template #element="{ element }">
                                <RecipeSuggestionPreview :recipe-suggestion="element as RecipeSuggestion"/>
                            </template>
                        </List>
                    </template>
                    <template v-else-if="submitted">
                        <h2>
                            No recipes found
                        </h2>
                    </template>

                    <template v-if="recipeSuggestions.length > 0">
                        <h2>
                            More recipes
                        </h2>
                        <List :list="moreRecipes">
                            <template #element="{ element }">
                                <RecipePreview :recipe="element as Recipe"/>
                            </template>
                        </List>
                    </template>
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
    IonIcon,
    IonPage,
    IonRange,
} from '@ionic/vue';
import {useRecipeStore} from '@/storage';
import {Item, Recipe, RecipeSuggestion, SearchQueryBuilder, suggestRecipes} from '@/tastebuddy';
import List from "@/components/recipe/List.vue";
import RecipePreview from "@/components/recipe/previews/RecipePreview.vue";
import RecipeSuggestionPreview from "@/components/recipe/previews/RecipeSuggestionPreview.vue";
import Searchbar from "@/components/utility/Searchbar.vue";
import FancyHeader from "@/components/utility/fancy/FancyHeader.vue";
import MiniRecipePreview from "@/components/recipe/previews/MiniRecipePreview.vue";
import ItemComponent from "@/components/recipe/Item.vue";
import {add, remove, trash} from "ionicons/icons";
import {addIcons} from "ionicons";
import FancyText from "@/components/utility/fancy/FancyText.vue";

export default defineComponent({
    name: 'RecipeSuggestionsPage',
    methods: {addIcons},
    components: {
        FancyText,
        MiniRecipePreview,
        FancyHeader,
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
        IonChip,
        ItemComponent,
        IonIcon
    },
    setup() {
        const recipeStore = useRecipeStore()

        const itemsById = computed(() => recipeStore.getItemsAsMap)
        const items: ComputedRef<Item[]> = computed(() => Object.values(itemsById.value ?? {}))
        const recipes = computed(() => recipeStore.getRecipesAsList)
        const savedRecipes = computed(() => recipeStore.getSavedRecipes)

        /* Suggested recipes */
        const suggestedRecipes: ComputedRef<Recipe[]> = computed(() => {
            const suggestedRecipes = [...recipes.value, ...savedRecipes.value]
                .filter(() => Math.random() < 0.5).slice(0, 6)
            suggestedRecipes.sort((a: Recipe, b: Recipe) => a.getDuration() - b.getDuration())
            return suggestedRecipes
        })

        /* Filtered items */
        const filteredItems = ref<Item[]>([])
        const filterInput = ref('')
        watch([filterInput, items], () => {
            if (filterInput.value === '') {
                filteredItems.value = []
            } else {
                filteredItems.value = (items.value ?? [])
                    .filter((item: Item) => item.getName()
                        .toLowerCase().includes((filterInput.value ?? '').toLowerCase()))
                    .filter((item: Item) => typeof itemQueries.value[item.getId()] === 'undefined')
            }
        }, {immediate: true})

        /* Selected items */
        const itemQueries = ref<{ [id: string]: boolean }>({})
        const selectedItems = computed<Item[]>(() => Object.keys(itemQueries.value)
            .map((id: string) => itemsById.value[id]))
        const selectedItemColors = computed<{
            [id: string]: string
        }>(() => Object.fromEntries(Object.entries(itemQueries.value)
            .map(([id, exclude]: [string, boolean]) => [id, exclude ? 'danger' : 'primary'])))
        const includeItem = (id: string) => {
            itemQueries.value[id] = false
        }
        const excludeItem = (id: string) => {
            itemQueries.value[id] = true
        }
        const removeItem = (id: string) => {
            delete itemQueries.value[id]
        }

        /* Items suggestions */
        const maxItemSuggestionsLength = 3
        const itemSuggestions = computed(() => {
            const itemsUsedInRecipes = (recipes.value ?? []).flatMap((recipe: Recipe) => recipe.getItems())
            const favItems = (suggestedRecipes.value ?? []).flatMap((recipe: Recipe) => recipe.getItems())

            const items: Item[] = [...itemsUsedInRecipes, ...favItems]
            const itemIds: string[] = []
            const itemSuggestions: Item[] = []
            for (const itemSuggestion of items) {
                if (!itemIds.includes(itemSuggestion.getId())
                    && typeof itemQueries.value[itemSuggestion.getId()] === 'undefined'
                    && itemIds.length < maxItemSuggestionsLength) {
                    itemIds.push(itemSuggestion.getId())
                    itemSuggestions.push(itemSuggestion)
                }
            }

            return itemSuggestions
        })

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
            searchQueryBuilder.setItemIds(itemQueries.value)
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
        const submitColor = computed<string>(() => recipeSuggestions.value.length === 0 ? 'success' : 'danger');
        const submitDisabled = computed<boolean>(() => recipeSuggestions.value.length === 0
            && selectedItems.value.length === 0)

        /* Recipes */
        const moreRecipes = computed(() => recipeStore.getRecipesAsList
            .filter((recipe: Recipe) => recipeSuggestions.value
                .every((suggestion: RecipeSuggestion) => suggestion.getRecipe().getId() !== recipe.getId())))

        return {
            /* Filtering */
            filterInput,
            includeItem, excludeItem, removeItem,
            filteredItems, selectedItems, selectedItemColors, itemQueries,
            city,
            /* Cooking Time */
            maxCookingTime, cookingTimes,
            /* Submit */
            submit, submitButton, submitColor, submitDisabled, submitted,
            /* Suggestions */
            RecipeSuggestion, recipeSuggestions, itemSuggestions,
            suggestedRecipes,
            /* Recipes */
            moreRecipes,
            /* Types */
            Item, Recipe,
            /* Icons */
            includeIcon: add, excludeIcon: remove, removeIcon: trash
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