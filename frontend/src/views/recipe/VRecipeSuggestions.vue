<template>
    <IonPage id="recipe-list-page">

        <IonContent :fullscreen="true">
            <div class="page">
                <div class="content">
                    <FancyHeader :big-text="['Discover', 'new recipes']" small-text="Hello"/>

                    <!-- Searchbar for ingredients and tools -->
                    <Searchbar v-model="filterInput" :elements="filteredItems" class="item-searchbar"
                               placeholder="What ingredients are you craving today?">
                        <template #element="{element}">
                            <ItemComponent :item="element as Item" lines="full"
                                           @click="includeItem((element as Item).getId())"/>
                        </template>
                    </Searchbar>

                    <h2>
                        Select the ingredients and tools you have
                    </h2>
                    <IonCard>
                        <IonCardContent>
                            <!-- Suggested and selected items -->
                            <List :list="[...selectedItems, ...itemSuggestions]" :load-all="true">
                                <template #element="{ element }">
                                    <ItemComponent :color="selectedItemColors[(element as Item).getId()]"
                                                   :disable-click="true"
                                                   :item="element as Item" lines="inset">
                                        <template #end>
                                            <div class="item-buttons">
                                                <IonButton
                                                    :color="itemQueries[(element as Item).getId()] === false ? 'success' : 'light'"
                                                    aria-description="Include item"
                                                    class="item-button" @click="includeItem((element as Item).getId())">
                                                    <IonIcon :icon="includeIcon"/>
                                                </IonButton>
                                                <IonButton
                                                    :color="itemQueries[(element as Item).getId()] ? 'danger' : 'light'"
                                                    aria-description="Exclude item"
                                                    class="item-button" @click="excludeItem((element as Item).getId())">
                                                    <IonIcon :icon="excludeIcon"/>
                                                </IonButton>
                                                <IonButton
                                                    v-if="typeof itemQueries[(element as Item).getId()] !== 'undefined'"
                                                    aria-description="Remove item"
                                                    class="item-button"
                                                    color="light" @click="removeItem((element as Item).getId())">
                                                    <IonIcon :icon="removeIcon"
                                                             @click="removeItem((element as Item).getId())"/>
                                                </IonButton>
                                            </div>
                                        </template>
                                    </ItemComponent>
                                </template>
                            </List>
                        </IonCardContent>
                    </IonCard>

                    <!-- Cooking time -->
                    <template v-if="selectedItems.length > 0">
                        <h2>
                            How long do you want to cook?
                        </h2>
                        <IonCard>
                            <IonCardContent>
                                <template v-for="time in cookingTimes" :key="time">
                                    <IonChip :outline="true" class="cooking-time"
                                             @click="maxCookingTime = time">
                                        {{ time }} min.
                                    </IonChip>
                                </template>
                                <IonChip :outline="true" class="recipe-price"
                                         @click="maxCookingTime = undefined">
                                    Any duration
                                </IonChip>
                                <IonRange v-model="maxCookingTime"
                                          :label="`${ maxCookingTime ? `${maxCookingTime} min.` : 'Any duration' }`"
                                          :max="60" :min="5" :pin="true"
                                          :pin-formatter="(value: number) => `${value} min.`"
                                          :snaps="true"
                                          :step="5" :ticks="false"
                                          label-placement="end"/>
                            </IonCardContent>
                        </IonCard>
                    </template>

                    <!-- Cooking time -->
                    <template v-if="selectedItems.length > 0">
                        <h2>
                            How much money do you want to spend?
                        </h2>
                        <IonCard>
                            <IonCardContent>
                                <template v-for="price in prices" :key="price">
                                    <IonChip :outline="true" class="recipe-price"
                                             @click="maxPrice = price">
                                        {{ price }} €
                                    </IonChip>
                                </template>
                                <IonChip :outline="true" class="recipe-price"
                                         @click="maxPrice = undefined">
                                    Any price
                                </IonChip>
                                <IonRange v-model="maxPrice" :label="`${maxPrice ?? 'Any'} €`"
                                          :max="20" :min="1" :pin="true"
                                          :pin-formatter="(value: number) => `${value} €`"
                                          :snaps="true"
                                          :step="1" :ticks="false"
                                          label-placement="end"/>
                            </IonCardContent>
                        </IonCard>
                    </template>


                    <!-- Suggested recipes -->
                    <template v-if="suggestedRecipes.length > 0 && recipeSuggestions.length === 0">
                        <h2>
                            Recommendations
                        </h2>
                        <List :horizontal="true" :list="suggestedRecipes"
                              :load-all="true"
                              :no-wrap="true">
                            <template #element="{ element }">
                                <div class="mini-recipe-preview">
                                    <MiniRecipePreview :recipe="element as Recipe"/>
                                </div>
                            </template>
                        </List>
                    </template>

                    <!-- Recipe suggestions -->
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
                </div>
            </div>

            <!-- Submit button -->
            <div v-if="!submitDisabled" class="search-button-wrapper">
                <IonButton :color="submitColor" :disabled="submitDisabled" class="search-button"
                           type="submit" @click="submit()">
                    {{ submitButton }} <IonIcon v-if="!submitted" :icon="submitIcon" class="search-button-icon"/>
                </IonButton>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts">
import {computed, ComputedRef, defineComponent, Ref, ref, watch} from 'vue';
import {IonButton, IonCard, IonCardContent, IonChip, IonContent, IonIcon, IonPage, IonRange,} from '@ionic/vue';
import {useRecipeStore} from '@/storage';
import {Item, Recipe, RecipeSuggestion, SearchQueryBuilder, suggestRecipes} from '@/tastebuddy';
import List from "@/components/recipe/List.vue";
import RecipeSuggestionPreview from "@/components/recipe/previews/RecipeSuggestionPreview.vue";
import Searchbar from "@/components/utility/Searchbar.vue";
import FancyHeader from "@/components/utility/fancy/FancyHeader.vue";
import MiniRecipePreview from "@/components/recipe/previews/MiniRecipePreview.vue";
import ItemComponent from "@/components/recipe/Item.vue";
import {add, remove, search, trash} from "ionicons/icons";

export default defineComponent({
    name: 'RecipeSuggestionsPage',
    components: {
        MiniRecipePreview,
        FancyHeader,
        Searchbar,
        RecipeSuggestionPreview,
        List,
        IonPage,
        IonContent,
        IonCard,
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

        /* City + Price */
        const city = ref('')
        const prices = [2, 3, 5, 10]
        const maxPrice = ref<number | undefined>(undefined)

        /* Max cooking time */
        const cookingTimes = [5, 10, 20, 45]
        const maxCookingTime = ref<number | undefined>(undefined)

        /* Recipes suggestions */
        const recipeSuggestions: Ref<RecipeSuggestion[]> = ref([])

        /* Suggest recipes */
        const suggest = () => {
            const searchQueryBuilder = new SearchQueryBuilder()
            searchQueryBuilder.setCity(city.value)
            searchQueryBuilder.setDuration(maxCookingTime.value)
            searchQueryBuilder.setItemIds(itemQueries.value)
            searchQueryBuilder.setPrice(maxPrice.value)
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
        const submitButton = computed<string>(() => recipeSuggestions.value.length === 0 ? 'Suggest Recipes' : 'Reset Suggestions');
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
            /* City + Price */
            city, prices, maxPrice,
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
            includeIcon: add, excludeIcon: remove, removeIcon: trash, submitIcon: search,
        }
    }
})
;
</script>

<style scoped>
.item-searchbar {
    margin-bottom: 1rem;
}

.item-buttons {
    margin-left: 10px;
    margin-right: 10px;
    display: flex;
}

.item-button {
    margin: 0;
}

.item-button::part(native) {
    border-radius: 0;
    padding: 10px;
}

.item-buttons .item-button:not(:last-child)::part(native) {
    border-right: none; /* Prevent double borders */
}

.item-buttons .item-button:first-child::part(native) {
    border-right: none; /* Prevent double borders */
    border-top-left-radius: var(--border-radius);
    border-bottom-left-radius: var(--border-radius);
}

.item-buttons .item-button:last-child::part(native) {
    border-right: none; /* Prevent double borders */
    border-top-right-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
}

.cooking-time {
    cursor: pointer;
}

.search-button-wrapper {
    position: fixed;
    width: 70%;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    z-index: 100;
}

.search-button::part(native) {
    border-radius: var(--border-radius);
    font-weight: bold;
}

.search-button-icon {
    margin-left: 10px;
}

.mini-recipe-preview {
    width: 100%;
    max-width: 200px;
}
</style>