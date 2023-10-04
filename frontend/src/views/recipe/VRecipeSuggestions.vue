<template>
    <IonPage id="recipe-list-page">
        <IonContent :fullscreen="true">
            <div class="page">
                <div class="content">
                    <FancyHeader :big-text="$t('Suggestions.Title').split(';')"/>

                    <!-- Searchbar for ingredients, tools and recipes -->
                    <Searchbar v-model="filterInput"
                               class="searchbar"
                               :elements="[...filteredRecipes, ...filteredItems, ...filteredTags]"
                               :placeholder="$t('Suggestions.SearchbarPrompt')"
                               @select-item="includeItem($event)"
                               @select-recipe="routeRecipe($event)"
                               @select-tag="includeTag($event)"/>

                    <TwoColumnLayout layout="rightBigger">
                        <template #left>
                            <div class="sticky">
                                <section>
                                    <h3>
                                        {{ $t('Suggestions.Preferences.Title')}}
                                    </h3>
                                    <h4 class="subheader">
                                        {{ $t('Suggestions.Preferences.Subtitle')}}
                                    </h4>

                                    <div class="over-x-scroll">
                                        <!-- Selected tags -->
                                        <IonChip v-for="(tag, tagIndex) in selectedTags"
                                                 :key="`selected-tag-${tagIndex}`" outline
                                                 class="tag">
                                            <IonLabel>{{ tag }}</IonLabel>
                                            <IonIcon :icon="closeCircleOutline" color="danger"
                                                     @click="(selectedTags ?? []).splice(tagIndex, 1)"/>
                                        </IonChip>
                                        <!-- Special tags -->
                                        <IonChip v-for="(specialTag, tagIndex) in specialTags"
                                                 :key="`special-tag-${tagIndex}`"
                                                 class="tag" color="primary" outline @click="specialTag.click()">
                                            <IonLabel>{{ specialTag.title }}</IonLabel>
                                        </IonChip>
                                        <!-- Suggested tags -->
                                        <IonChip v-for="(tag, tagIndex) in suggestedTags"
                                                 :key="`suggested-tag-${tagIndex}`"
                                                 class="tag" outline @click="includeTag(tag)">
                                            <IonLabel>{{ tag }}</IonLabel>
                                            <IonIcon :icon="add"/>
                                        </IonChip>
                                    </div>

                                    <IonAccordionGroup :multiple="true" :value="[...searchFilters]">
                                        <IonAccordion value="items" class="search-filter">
                                            <IonItem slot="header">
                                                <IonLabel>
                                                    {{ $t('Suggestions.Preferences.Inventory')}}
                                                </IonLabel>
                                            </IonItem>
                                            <div slot="content">
                                                <!-- Suggested and selected items -->
                                                <IonCard>
                                                    <IonCardContent>
                                                        <List :list="[...selectedItems, ...itemSuggestions]" load-all>
                                                            <template #element="{ element }">
                                                                <ItemComponent

                                                                    :item="element as Item"
                                                                    :include="itemQueries[(element as Item).getId()]">
                                                                    <template #end>
                                                                        <div class="item-buttons">
                                                                            <IonButton
                                                                                :color="itemQueries[(element as Item).getId()] === false ? 'danger' : 'light'"
                                                                                :disabled="itemQueries[(element as Item).getId()] === false"
                                                                                aria-description="Exclude item"
                                                                                class="item-button"
                                                                                shape="round"
                                                                                @click="excludeItem(element)">
                                                                                <IonIcon :icon="remove"/>
                                                                            </IonButton>
                                                                            <IonButton
                                                                                :color="itemQueries[(element as Item).getId()] ? 'success' : 'light'"
                                                                                :disabled="itemQueries[(element as Item).getId()]"
                                                                                aria-description="Include item"
                                                                                class="item-button"
                                                                                shape="round"
                                                                                @click="includeItem(element)">
                                                                                <IonIcon :icon="add"/>
                                                                            </IonButton>
                                                                            <IonButton
                                                                                v-if="typeof itemQueries[(element as Item).getId()] !== 'undefined'"
                                                                                aria-description="Remove item"
                                                                                class="item-button"
                                                                                color="light"
                                                                                shape="round"
                                                                                @click="removeItem(element)">
                                                                                <IonIcon :icon="close"/>
                                                                            </IonButton>
                                                                        </div>
                                                                    </template>
                                                                </ItemComponent>
                                                            </template>
                                                        </List>
                                                    </IonCardContent>
                                                </IonCard>
                                            </div>
                                        </IonAccordion>

                                        <!-- Cooking time -->
                                        <IonAccordion class="suggestion-filter" value="duration">
                                            <IonItem slot="header">
                                                <IonLabel>
                                                    {{ $t('Suggestions.Preferences.Time')}}
                                                </IonLabel>
                                            </IonItem>
                                            <div slot="content">
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
                                            </div>
                                        </IonAccordion>

                                        <!-- Price -->
                                        <IonAccordion class="suggestion-filter" value="price">
                                            <IonItem slot="header">
                                                <IonLabel>
                                                    {{ $t('Suggestions.Preferences.Budget')}}
                                                </IonLabel>
                                            </IonItem>
                                            <div slot="content">
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
                                                        <IonRange v-model="maxPrice"
                                                                  :label="`${ maxPrice ? `${maxPrice} €` : 'Any price' }`"
                                                                  :max="20" :min="1" :pin="true"
                                                                  :pin-formatter="(value: number) => `${value} €`"
                                                                  :snaps="true"
                                                                  :step="1" :ticks="false"
                                                                  label-placement="end"/>
                                                    </IonCardContent>
                                                </IonCard>
                                            </div>
                                        </IonAccordion>

                                        <!-- Servings -->
                                        <IonAccordion class="suggestion-filter" value="servings">
                                            <IonItem slot="header">
                                                <IonLabel>
                                                    {{ $t('Suggestions.Preferences.Serving')}}
                                                </IonLabel>
                                            </IonItem>
                                            <div slot="content">
                                                <IonCard>
                                                    <IonCardContent>
                                                        <IonItem lines="none">
                                                            <IonButtons slot="start">
                                                                <IonButton :disabled="servings == 1"
                                                                           @click="servings--">
                                                                    <IonIcon :icon="remove"/>
                                                                </IonButton>
                                                                <IonButton :disabled="servings == 100"
                                                                           @click="servings++">
                                                                    <IonIcon :icon="add"/>
                                                                </IonButton>
                                                            </IonButtons>
                                                            <IonLabel>
                                                                {{ servings }} {{ $t('Recipe.Serving', servings) }}
                                                            </IonLabel>
                                                        </IonItem>
                                                    </IonCardContent>
                                                </IonCard>
                                            </div>
                                        </IonAccordion>
                                    </IonAccordionGroup>
                                </section>
                            </div>
                        </template>
                        <template #right>

                            <!-- Suggested recipes -->
                            <section v-if="suggestedRecipes.length > 0">
                                <h3>
                                    {{ $t('Suggestions.Recommendations.Title') }}
                                </h3>
                                <h4 class="subheader">
                                    {{ $t('Suggestions.Recommendations.Subtitle') }}
                                </h4>
                                <HorizontalList :list="suggestedRecipes">
                                    <template #element="{ element }">
                                        <div class="mini-recipe-preview">
                                            <MiniRecipePreview :recipe="element as Recipe"/>
                                        </div>
                                    </template>
                                </HorizontalList>
                            </section>

                            <!-- Searched recipes -->
                            <a id="recipe-search" ref="recipeSearchAnchor"/>
                            <section v-if="searchedRecipes.length > 0 && submitted">
                                <h3>
                                    {{ $t('Suggestions.Search.Title', [searchedRecipes.length]) }}
                                </h3>
                                <h4 class="subheader">
                                    {{ $t('Suggestions.Search.Subtitle') }}
                                </h4>
                                <List :list="searchedRecipes">
                                    <template #element="{ element }">
                                        <RecipePreview :key="element.id" :recipe="element as RecipeSuggestion"/>
                                    </template>
                                </List>
                            </section>
                            <section v-else-if="submitted">
                                <h3>
                                    No recipes found
                                </h3>
                            </section>
                        </template>
                    </TwoColumnLayout>

                    <!-- Submit button -->
                    <div class="search-button-wrapper">
                        <IonButton :color="submitColor" class="search-button"
                                   type="submit" @click="submit()">
                            {{ submitButton }}
                            <IonIcon v-if="!submitted" :icon="search" class="search-button-icon"/>
                        </IonButton>
                    </div>
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script setup lang="ts">
import {computed, ComputedRef, Ref, ref, watch} from 'vue';
import {
    IonAccordion,
    IonAccordionGroup,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonChip,
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonPage,
    IonRange,
    useIonRouter,
} from '@ionic/vue';
import {useRecipeStore} from '@/storage';
import {index, Item, Recipe, RecipeSuggestion, SearchQueryBuilder} from '@/tastebuddy';
import Searchbar from "@/components/recipe/Searchbar.vue";
import FancyHeader from "@/components/utility/fancy/FancyHeader.vue";
import MiniRecipePreview from "@/components/recipe/previews/MiniRecipePreview.vue";
import ItemComponent from "@/components/recipe/Item.vue";
import {add, close, closeCircleOutline, remove, search} from "ionicons/icons";
import TwoColumnLayout from "@/components/layout/TwoColumnLayout.vue";
import HorizontalList from "@/components/utility/list/HorizontalList.vue";
import List from "@/components/utility/list/List.vue";
import RecipePreview from "@/components/recipe/previews/RecipePreview.vue";

const recipeStore = useRecipeStore()
const router = useIonRouter()

const itemsById = computed(() => recipeStore.getItemsAsMap)
const items: ComputedRef<Item[]> = computed(() => Object.values(itemsById.value ?? {}))
const recipes = computed(() => recipeStore.getRecipesAsList)
const tags = computed(() => recipeStore.getTags)
const savedRecipes = computed(() => recipeStore.getSavedRecipes)

/* Filtered tags, recipes & items */
const filterInput = ref<string>('')
const searchFilters = ref<Set<string>>(new Set(['items']))

// Tags
const filteredTags = ref<string[]>([])
watch([filterInput, tags], () => {
    const _filteredTags: string[] = filterInput.value === '' ? [] : (tags.value ?? [])
        .filter((tag: string) => tag.toLowerCase().includes((filterInput.value ?? '').toLowerCase()))
    filteredTags.value = _filteredTags.slice(0, 3)
}, {immediate: true})

// Recipes
const filteredRecipes = ref<Recipe[]>([])
watch([filterInput, recipes], () => {
    const _filteredRecipes = filterInput.value === '' ? [] : (recipes.value ?? [])
        .filter((recipe: Recipe) => recipe.getName()
            .toLowerCase().includes((filterInput.value ?? '').toLowerCase()));
    filteredRecipes.value = _filteredRecipes.slice(0, 3)
}, {immediate: true})
const routeRecipe = (recipe?: Recipe) => {
    router.push({name: 'Recipe', params: {id: recipe?.getId() ?? ''}})
}

// Items
const filteredItems = ref<Item[]>([])
watch([filterInput, items], () => {
    let _filteredItems: Item[]
    if (filterInput.value === '') {
        _filteredItems = []
    } else {
        _filteredItems = (items.value ?? [])
            .filter((item: Item) => item.hasName(filterInput.value ?? ''))
            .filter((item: Item) => typeof itemQueries.value[item.getId()] === 'undefined')
    }
    filteredItems.value = _filteredItems.slice(0, 5)
}, {immediate: true})

const itemQueries = ref<{ [id: string]: boolean }>({})
const selectedItems = computed<Item[]>(() => Object.keys(itemQueries.value)
    .map((id: string) => itemsById.value[id]))
const includeItem = (item?: Item) => {
    itemQueries.value[item?.getId() ?? ''] = true
    searchFilters.value.add('items')
}
const excludeItem = (item?: Item) => {
    itemQueries.value[item?.getId() ?? ''] = false
}
const removeItem = (item?: Item) => {
    delete itemQueries.value[item?.getId() ?? '']
}

// Item suggestions
const maxItemSuggestionsLength = 3
const itemSuggestions = computed(() => recipeStore.getItemSuggestions
    .filter((item: Item) => typeof itemQueries.value[item.getId()] === 'undefined')
    .slice(0, maxItemSuggestionsLength)
)

// Tags
const selectedTags = ref<string[]>([])
const suggestedTags = computed(() => recipeStore.getTags
    .filter((tag: string) => !selectedTags.value.includes(tag))
    .slice(0, 3)
)
const specialTags = [
    {
        title: 'fast & cheap',
        click: () => {
            maxCookingTime.value = 8
            maxPrice.value = 3
        }
    }
]
const includeTag = (tag: string) => selectedTags.value.push(tag)

// City
const city = ref('')
const prices = [2, 3, 5, 10]
const maxPrice = ref<number | undefined>(undefined)
watch(maxPrice, () => searchFilters.value.add('price'))

// Cooking time
const cookingTimes = [5, 10, 20, 45]
const maxCookingTime = ref<number | undefined>(undefined)
watch(maxCookingTime, () => searchFilters.value.add('duration'))

// Servings
const servings = ref(1)
watch(servings, () => searchFilters.value.add('servings'))

// Recipe suggestions
const suggestedRecipesLength = 15
const suggestedRecipes: ComputedRef<Recipe[]> = computed(() => {
    const suggestedRecipes = [...recipes.value, ...savedRecipes.value]
        .filter(() => Math.random() < 1 / (recipes.value.length * 0.1)).slice(0, suggestedRecipesLength)
    suggestedRecipes.sort((a: Recipe, b: Recipe) => a.getDuration() - b.getDuration())
    return suggestedRecipes
})

/* Recipe search */
const searchedRecipes: Ref<RecipeSuggestion[]> = ref([])
const suggest = () => {
    const searchQueryBuilder = new SearchQueryBuilder()
    searchQueryBuilder.setCity(city.value)
    searchQueryBuilder.setDuration(maxCookingTime.value)
    searchQueryBuilder.setItemIds(itemQueries.value)
    searchQueryBuilder.setPrice(maxPrice.value)
    searchQueryBuilder.setTags(selectedTags.value)
    const query = searchQueryBuilder.build()
    searchedRecipes.value = index(query)
}

/* Submit button */
const recipeSearchAnchor = ref<HTMLAnchorElement | null>(null)
const submitted = ref(false)
const submit = () => {
    if (searchedRecipes.value.length === 0) {
        // suggest recipes
        submitted.value = true
        suggest()
        setTimeout(() => {
            recipeSearchAnchor.value?.scrollIntoView({behavior: 'smooth', block: "start"})
        }, 100)
    } else {
        // reset
        submitted.value = false
        searchedRecipes.value = []
    }
}
const submitButton = computed<string>(() => searchedRecipes.value.length === 0 ? 'Suggest Recipes' : 'Reset Suggestions');
const submitColor = computed<string>(() => searchedRecipes.value.length === 0 ? 'success' : 'danger');
</script>

<style scoped>
.searchbar {
    margin-bottom: 1rem;
}

section {
    margin-top: var(--margin-s);
    margin-bottom: var(--margin-s);
}

.item-buttons {
    display: flex;
}

.item-button {
    margin: 0;
    font-size: var(--font-size-smaller);
}

.item-button::part(native) {
    border-radius: 0;
    padding: 3px 12px;
}

@media (width <= 414px) {
    .item-button::part(native) {
        padding: 2px 8px;
    }
}

@media (width <= 350px) {
    .item-button::part(native) {
        padding: 1px 4px;
    }
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

#recipe-search {
    scroll-margin-top: 500px;
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