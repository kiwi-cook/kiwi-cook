<!--
  - Copyright (c) 2023 Josef Müller.
  -->

<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div class="content-wrapper">
                <div class="content">
                    <Header :big-text="$t('Suggestions.Title').split(';')" :small-text="$t('Suggestions.Subtitle')"/>

                    <!-- Searchbar for ingredients, tools, recipes and tags -->
                    <Searchbar v-model="filterInput" :items="filteredItems"
                               :placeholder="$t('Suggestions.SearchbarPrompt')" :recipes="recipes"
                               :tags="filteredTags"
                               class="searchbar"
                               @select-item="includeItem($event);
                                             preferencesActive = true;
                                             activePreference = 'ingredients'"
                               @select-preferences="preferencesActive = $event"
                               @select-tag="includeTag($event);
                                            preferencesActive = true;
                                            activePreference = 'tags'"/>

                    <!-- Preferences -->
                    <Transition name="fade-top">
                        <div v-if="preferencesActive">
                            <IonChip :outline="activePreference === 'ingredients'"
                                     @click="activePreference = 'ingredients'">
                                <IonIcon :icon="list"/>
                                <IonLabel>{{ selectedItems.length }}
                                    {{ $t('Suggestions.Preferences.Ingredients', selectedItems.length) }}
                                </IonLabel>
                            </IonChip>
                            <Duration :always-show="true"
                                      :class="`ion-chip-outline ${activePreference === 'duration' ? 'active' : ''}`"
                                      :duration="maxCookingTime"
                                      @click="activePreference = 'duration'">
                                {{ $t('Suggestions.Preferences.Duration') }}
                            </Duration>
                            <IonChip :outline="activePreference === 'tags'"
                                     @click="activePreference = 'tags'">
                                <IonLabel># {{ selectedTags.length }}
                                    {{ $t('Suggestions.Preferences.Tags', tags.length) }}
                                </IonLabel>
                            </IonChip>
                            <IonChip :outline="activePreference === 'servings'"
                                     @click="activePreference = 'servings'">
                                <IonLabel>{{ servings }} {{
                                    $t('Suggestions.Preferences.Servings', servings)
                                }}
                                </IonLabel>
                            </IonChip>

                            <!-- Selected items -->
                            <IonCard v-if="activePreference === 'ingredients'">
                                <IonCardContent>
                                    <List :list="[...selectedItems, ...itemSuggestions]" load-all>
                                        <template #element="{ element }">
                                            <ItemComponent :include="itemQueries[(element as Item).getId()]"
                                                           :item="element as Item">
                                                <template #end>
                                                    <div class="item-buttons">
                                                        <IonButton
                                                            :color="itemQueries[(element as Item).getId()] === false ?
                                                                'danger' : 'light'"
                                                            :disabled="itemQueries[(element as Item).getId()] === false"
                                                            aria-description="Exclude item"
                                                            class="item-button" shape="round"
                                                            @click="excludeItem(element)">
                                                            <IonIcon :icon="remove"/>
                                                        </IonButton>
                                                        <IonButton
                                                            :color="itemQueries[(element as Item).getId()] ?
                                                                'success' : 'light'"
                                                            :disabled="itemQueries[(element as Item).getId()]"
                                                            aria-description="Include item"
                                                            class="item-button" shape="round"
                                                            @click="includeItem(element)">
                                                            <IonIcon :icon="add"/>
                                                        </IonButton>
                                                        <IonButton
                                                            v-if="((element as Item).getId() in itemQueries)"
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

                            <!-- Duration -->
                            <IonCard v-if="activePreference === 'duration'">
                                <IonCardContent>
                                    <template v-for="time in cookingTimes" :key="time">
                                        <Duration :duration="time" class="cooking-time" no-icon outline
                                                  @click="maxCookingTime = time"/>
                                    </template>
                                    <IonChip class="recipe-price" outline
                                             @click="maxCookingTime = undefined">
                                        Any duration
                                    </IonChip>
                                    <IonRange v-model="maxCookingTime"
                                              :label="`${maxCookingTime ? `${maxCookingTime} min.` : 'Any duration'}`"
                                              :max="60" :min="0" :pin="true"
                                              :pin-formatter="(value: number) => `${value} min.`"
                                              :snaps="true" :step="5" :ticks="false"
                                              label-placement="end"/>
                                </IonCardContent>
                            </IonCard>

                            <!-- Servings -->
                            <IonCard v-if="activePreference === 'servings'">
                                <IonCardContent>
                                    <IonItem lines="none">
                                        <IonButtons slot="start">
                                            <IonButton :disabled="servings === 1"
                                                       @click="servings--">
                                                <IonIcon :icon="remove"/>
                                            </IonButton>
                                            <IonButton :disabled="servings === 100"
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

                            <!-- Price -->
                            <IonCard v-if="activePreference === 'price'">
                                <IonCardContent>
                                    <template v-for="price in prices" :key="price">
                                        <IonChip class="recipe-price" outline
                                                 @click="maxPrice = price">
                                            {{ price }} €
                                        </IonChip>
                                    </template>
                                    <IonChip class="recipe-price" outline
                                             @click="maxPrice = undefined">
                                        Any price
                                    </IonChip>
                                    <IonRange v-model="maxPrice"
                                              :label="`${maxPrice ? `${maxPrice} €` : 'Any price'}`"
                                              :max="20" :min="1" :pin="true"
                                              :pin-formatter="(value: number) => `${value} €`"
                                              :snaps="true"
                                              :step="1" :ticks="false" label-placement="end"/>
                                </IonCardContent>
                            </IonCard>

                            <!-- Tags -->
                            <IonCard v-if="activePreference === 'tags'">
                                <IonCardContent>
                                    <div class="over-x-scroll">
                                        <!-- Selected tags -->
                                        <IonChip v-for="(tag, tagIndex) in selectedTags"
                                                 :key="`selected-tag-${tagIndex}`"
                                                 class="tag" outline>
                                            <IonLabel>{{ tag }}</IonLabel>
                                            <IonIcon :icon="closeCircleOutline" color="danger"
                                                     @click="(selectedTags ?? []).splice(tagIndex, 1)"/>
                                        </IonChip>
                                        <!-- Special tags -->
                                        <IonChip v-for="(specialTag, tagIndex) in specialTags"
                                                 :key="`special-tag-${tagIndex}`" class="tag" color="primary" outline
                                                 @click="specialTag.click()">
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
                                </IonCardContent>
                            </IonCard>
                        </div>
                    </Transition>

                    <BigRecipePreview v-if="recipeOfTheDay" :recipe="recipeOfTheDay"
                                      :title="t('RecipeOfTheDay.Title')"/>

                    <!-- Predicted/Recommended recipes -->
                    <section v-if="predictedRecipes.length > 0">
                        <h3>
                            {{ predictedRecipes.length }}
                            {{ $t('Suggestions.Recommendations.Title', predictedRecipes.length) }}
                        </h3>
                        <h4 class="subheader">
                            {{ $t('Suggestions.Recommendations.Subtitle') }}
                        </h4>
                        <HorizontalList :list="predictedRecipes">
                            <template #element="{ element }: { element: Recipe}">
                                <MiniRecipePreview :key="element.id" :duration="element.getDuration()"
                                                   :img-url="element.props.imgUrl"
                                                   :link="element.getRoute()"
                                                   :name="element.getName()"/>
                            </template>
                        </HorizontalList>
                    </section>

                    <!-- Random recipes -->
                    <section v-if="randomRecipes.length > 0">
                        <h3>
                            {{ $t('Suggestions.Random.Title') }}
                        </h3>
                        <h4 class="subheader">
                            {{ $t('Suggestions.Random.Subtitle') }}
                        </h4>
                        <HorizontalList :list="randomRecipes">
                            <template #element="{ element }: { element: Recipe}">
                                <MiniRecipePreview :key="element.id" :duration="element.getDuration()"
                                                   :img-url="element.props.imgUrl"
                                                   :link="element.getRoute()"
                                                   :name="element.getName()"/>
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
                            {{ $t('Suggestions.Search.NoRecipesFound') }}
                        </h3>
                    </section>
                </div>
            </div>

            <!-- Fab timer -->
            <FabTimer/>
            <IonFab slot="fixed" horizontal="center" vertical="bottom">
                <IonButton class="smart-search-button" shape="round" @click="submit">
                    <IonIcon slot="start" :icon="sparklesOutline"/>
                    <strong>Smart Search</strong>
                </IonButton>
            </IonFab>
        </IonContent>
    </IonPage>
</template>

<script lang="ts" setup>
import {computed, ref, Transition, watch} from 'vue';
import {
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonChip,
    IonContent,
    IonFab,
    IonIcon,
    IonItem,
    IonLabel,
    IonPage,
    IonRange,
} from '@ionic/vue';
import {useRecipeStore} from '@/app/storage';
import {Item, Recipe} from '@/shared';
import Searchbar from '@/app/components/recipe/Searchbar.vue';
import Header from '@/shared/components/utility/header/Header.vue';
import MiniRecipePreview from '@/app/components/recipe/previews/MiniRecipePreview.vue';
import ItemComponent from '@/shared/components/recipe/Item.vue';
import {add, close, closeCircleOutline, list, remove, sparklesOutline} from 'ionicons/icons';
import HorizontalList from '@/shared/components/utility/list/HorizontalList.vue';
import List from '@/shared/components/utility/list/List.vue';
import RecipePreview from '@/app/components/recipe/previews/RecipePreview.vue';
import {useI18n} from 'vue-i18n';
import BigRecipePreview from '@/app/components/recipe/previews/BigRecipePreview.vue';
import {RecipeSuggestion, SearchQueryBuilder, searchRecipes} from '@/app/search';
import Duration from '@/shared/components/recipe/chip/Duration.vue';
import FabTimer from '@/shared/components/utility/FabTimer.vue';

const {t} = useI18n()
const recipeStore = useRecipeStore()

const recipeOfTheDay = computed<Recipe>(() => recipeStore.getRecipeOfTheDay)

const itemsById = computed(() => recipeStore.getItemsAsMap)
const items = computed<Item[]>(() => Object.values(itemsById.value ?? {}))
const recipes = computed(() => recipeStore.getRecipesAsList)
const tags = computed(() => recipeStore.getTags)

/* Filtered tags, recipes & items */
const filterInput = ref<string>('')
const searchFilters = ref<Set<string>>(new Set(['items']))
const preferencesActive = ref(false) /* Overridden by Searchbar */
const activePreference = ref('ingredients')

// Tags
const filteredTags = ref<string[]>([])
watch(filterInput, () => {
    const _filteredTags: string[] = filterInput.value === '' ? [] : (tags.value ?? [])
        .filter((tag: string) => tag.toLowerCase().includes((filterInput.value ?? '').toLowerCase()))
    filteredTags.value = _filteredTags.slice(0, 3)
})

// Items
const filteredItems = ref<Item[]>([])
watch(filterInput, () => {
    let _filteredItems: Item[]
    if (filterInput.value === '') {
        _filteredItems = []
    } else {
        _filteredItems = (items.value ?? [])
            .filter((item: Item) => item.hasName(filterInput.value ?? ''))
            .filter((item: Item) => typeof itemQueries.value[item.getId()] === 'undefined')
    }
    filteredItems.value = _filteredItems.slice(0, 5)
})

const itemQueries = ref<{ [id: string]: boolean }>({})
const selectedItems = computed<Item[]>(() => Object.keys(itemQueries.value)
    .map((id: string) => itemsById.value[id]))
const includeItem = (item?: Item) => {
    itemQueries.value[item?.getId() ?? ''] = true
    searchFilters.value.add('items')
}
const excludeItem = (item?: Item) => itemQueries.value[item?.getId() ?? ''] = false
const removeItem = (item?: Item) => delete itemQueries.value[item?.getId() ?? '']

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
// const city = ref('')
const prices = [2, 3, 5, 10]
const maxPrice = ref<number | undefined>(undefined)
watch(maxPrice, () => searchFilters.value.add('price'))

// Cooking time
const cookingTimes = [5, 10, 20, 45, 60, 90, 120, 60 * 24]
const maxCookingTime = ref<number | undefined>(undefined)
watch(maxCookingTime, () => searchFilters.value.add('duration'))

// Servings
const servings = ref(1)
watch(servings, () => searchFilters.value.add('servings'))

// Recipe suggestions
/* Random recipes */
const randomRecipesLength = 15
const randomRecipes = computed<Recipe[]>(() => {
    return [...recipes.value]
        .filter(() => Math.random() < 1 / (recipes.value.length * 0.1))
        .slice(0, randomRecipesLength)
        .toSorted((a: Recipe, b: Recipe) => a.getDuration() - b.getDuration())
})

/* Computed recipe suggestions */
const predictedRecipes = computed<Recipe[]>(() => recipeStore.getRecipePredictions)

/* Recipe index */
const searchedRecipes = ref<RecipeSuggestion[]>([])
const suggest = () => {
    const searchQueryBuilder = new SearchQueryBuilder()
    searchQueryBuilder.setDuration(maxCookingTime.value)
    searchQueryBuilder.setItemIds(itemQueries.value)
    searchQueryBuilder.setTags(selectedTags.value)

    // TODO: fix price calculation
    // searchQueryBuilder.setPrice(maxPrice.value)

    // TODO: enable city index
    //searchQueryBuilder.setCity(city.value)

    const query = searchQueryBuilder.build()
    searchedRecipes.value = searchRecipes(query)
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
            recipeSearchAnchor.value?.scrollIntoView({behavior: 'smooth', block: 'start'})
        }, 50)
    } else {
        // reset
        submitted.value = false
        searchedRecipes.value = []
    }
}
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
    border-right: none;
    /* Prevent double borders */
}

.item-buttons .item-button:first-child::part(native) {
    border-right: none;
    /* Prevent double borders */
    border-top-left-radius: var(--border-radius);
    border-bottom-left-radius: var(--border-radius);
}

.item-buttons .item-button:last-child::part(native) {
    border-right: none;
    /* Prevent double borders */
    border-top-right-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
}

.cooking-time {
    cursor: pointer;
}

#recipe-search {
    scroll-margin-top: 500px;
}

@keyframes liquidGradient {
    0% {
        background-position: 0 50%
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0 50%;
    }
}

.smart-search-button::part(native) {
    /* Basic styling */
    display: inline-block;
    padding: 10px 20px;
    font-size: 16px;
    font-weight: bold;
    text-align: center;
    text-decoration: none;
    border: none;
    border-radius: 20px;
    cursor: pointer;

    /* Colors and shadows */
    color: #fff;
    background: radial-gradient(circle at top left, #62c370, #c362b5, #6ab1e1),
    linear-gradient(45deg, #6ab1e1, #62c370, #c362b5, #6ab1e1),
    radial-gradient(circle at bottom right, #62c370, #c362b5, #6ab1e1),
    linear-gradient(135deg, #6ab1e1, #62c370, #c362b5, #6ab1e1);
    background-size: 200% 200%; /* Increase background size for the gradient animation */
    box-shadow: 0 17px 10px -10px rgba(0, 0, 0, 0.4);

    /* Animations */
    transition: background 1s ease-in-out,
    transform ease-in-out 300ms,
    box-shadow ease-in-out 300ms,
    scale ease-in-out 300ms;
    animation: liquidGradient 5s infinite ease; /* Apply the liquid gradient animation */
}

.smart-search-button::part(native):hover {
    /* Hover effects */
    box-shadow: 0 37px 20px -15px rgba(0, 0, 0, 0.2);
    transform: translate(0px, -5px);
    scale: 1.05;
}
</style>