<!--
  - Copyright (c) 2023-2024 Josef Müller.
  -->

<template>
    <div :class="['searchbar-wrapper', {'active': resultsOpen || preferencesOpen }]">
        <div ref="searchbar">
            <div class="searchbar-blur"/>
            <div :class="['searchbar-search-wrapper', {'active': preferencesOpen}]">
                <input ref="searchbarInput" v-model="filterInput"
                       :placeholder="$t('Suggestions.SearchbarPrompt')" class="searchbar-search"
                       @focus="openPreferences()"
                       @ionClear="filterInput = ''" @keydown.esc="closeAll()" @keydown.enter="search"/>
                <button :class="['searchbar-button', 'search', {disabled: !preferencesOpen}]" @click="search">
                    <IonIcon :icon="searchIcon"/>
                </button>
            </div>

            <!-- Preferences -->
            <Transition name="fade-top">
                <div v-show="resultsOpen || preferencesOpen" class="searchbar-quick-preferences">
                    <QuickPreferenceContainer>
                        <template #preferences>

                            <!-- Cooking time -->
                            <QuickPreference name="cookingTime">
                                <template #title><span class="highlight">
                                    {{
                                        USER_PREFERENCES_COMPUTED.timeAvailable > SEARCHBAR_CONFIGURATION.MAX_TIME -
                                            SEARCHBAR_CONFIGURATION.STEP_TIME ? '> 60' : USER_PREFERENCES_COMPUTED.timeAvailable
                                    }} Minuten</span> Kochzeit
                                </template>
                                <!-- TODO: add logarithmic slider -->
                                <template #default>
                                    <IonRange v-model="USER_PREFERENCES.timeAvailable"
                                              :max="SEARCHBAR_CONFIGURATION.MAX_TIME"
                                              :min="SEARCHBAR_CONFIGURATION.MIN_TIME"
                                              :step="SEARCHBAR_CONFIGURATION.STEP_TIME"
                                              pin snaps/>
                                </template>
                            </QuickPreference>

                            <!-- Servings -->
                            <QuickPreference name="servings">
                                <template #title><span class="highlight">{{
                                    USER_PREFERENCES_COMPUTED.servings
                                }} Portionen</span>
                                </template>
                                <template #default>
                                    <IonRange v-model="USER_PREFERENCES.servings"
                                              :max="10" :min="1"
                                              :step="1" pin snaps/>
                                </template>
                            </QuickPreference>

                            <QuickPreference is-button name="items" @visible="openAll">
                                <template #title>
                                    <span class="highlight">
                                        {{
                                            USER_PREFERENCES_COMPUTED.items.length >
                                                0 ? USER_PREFERENCES_COMPUTED.items.length : 'Keine'
                                        }}
                                    </span> Zutaten
                                </template>
                            </QuickPreference>

                            <QuickPreference name="tags">
                                <template #title>
                                    <span class="highlight">
                                        {{
                                            USER_PREFERENCES_COMPUTED.tags.length >
                                                0 ? USER_PREFERENCES_COMPUTED.tags.length : 'Keine'
                                        }}
                                    </span> Tags
                                </template>
                                <template #default>
                                    <HorizontalList :list="[...USER_PREFERENCES_COMPUTED.tags, ...suggestedTags]"
                                                    no-wrap>
                                        <template #element="{element}">
                                            <template v-if="typeof element === 'string'">
                                                <IonChip outline @click="includeTag(element)">
                                                    <IonLabel>{{ element }}</IonLabel>
                                                </IonChip>
                                            </template>
                                            <template v-else>
                                                <IonChip :color="element?.color" outline
                                                         @click="element?.func(); includeTag(element?.name)">
                                                    <IonLabel>{{ element?.name }}</IonLabel>
                                                </IonChip>
                                            </template>
                                        </template>
                                    </HorizontalList>
                                </template>
                            </QuickPreference>
                        </template>

                        <template #full-width-content>
                            <div class="content-margin"/>
                        </template>
                    </QuickPreferenceContainer>
                </div>
            </Transition>

            <Transition name="fade-top">
                <div v-if="(filterInput !== '' && preferencesOpen) || resultsOpen" class="searchbar-list-wrapper">
                    <div class="searchbar-list">
                        <div class="searchbar-list-results">
                            <IonItem lines="none">
                                <h4>Zutaten</h4>
                            </IonItem>

                            <template v-if="selectedItems.length > 0">
                                <IonItem lines="none">
                                    <h5 class="subheader">Ausgewählte Zutaten</h5>
                                </IonItem>
                                <IonItem lines="none">
                                    <HorizontalList :list="selectedItems" no-wrap>
                                        <template #element="{element}">
                                            <QuickItemChip
                                                v-model:included="USER_PREFERENCES.items[element?.getId() ?? '']"
                                                :item="element" only-remove
                                                @removed="removeItem(element)"/>
                                        </template>
                                    </HorizontalList>
                                </IonItem>
                            </template>

                            <IonItem lines="none">
                                <h5 class="subheader">Schnelle Suche</h5>
                            </IonItem>
                            <IonItem lines="none">
                                <HorizontalList :list="[...filteredItems, ...itemSuggestions]" no-wrap>
                                    <template #element="{element}">
                                        <QuickItemChip v-model:included="USER_PREFERENCES.items[element?.getId() ?? '']"
                                                       :item="element"
                                                       @removed="removeItem(element)"/>
                                    </template>
                                </HorizontalList>
                            </IonItem>

                            <!-- <IonItem lines="none">
                                <h5>Rezepte</h5>
                                <HorizontalList v-if="filteredRecipes?.length === 0" :list="recipeSuggestions" no-wrap>
                                    <template #element="{element}">
                                        <MiniRecipePreview :img-url="element?.props?.imgUrl"
                                                           :link="element?.getRoute()"
                                                           :name="element?.getName()" :recipe="element"
                                                           @click="selectRecipe(element)"/>
                                    </template>
                                </HorizontalList>
                                <HorizontalList v-else :list="filteredRecipes" no-wrap>
                                    <template #element="{element}">
                                        <MiniRecipePreview :img-url="element?.props?.imgUrl"
                                                           :link="element?.getRoute()"
                                                           :name="element?.getName()" :recipe="element"
                                                           @click="selectRecipe(element)"/>
                                    </template>
                                </HorizontalList>
                            </IonItem> -->
                        </div>
                    </div>
                </div>
            </Transition>
        </div>
    </div>
</template>


<script lang="ts" setup>
import { computed, ref, toRefs, Transition, watch } from 'vue';
import { IonChip, IonIcon, IonItem, IonLabel, IonRange, useIonRouter } from '@ionic/vue';
import { HorizontalList, Item, Recipe } from '@/shared';
import { searchRecipes, searchRecipesByQuery } from '@/app/search/search.ts';
import { useRecipeStore } from '@/app/storage';
import { onClickOutside } from '@vueuse/core'
import { searchOutline as searchIcon } from 'ionicons/icons'
import { QuickItemChip, QuickPreference, QuickPreferenceContainer } from '@/app/components/search';
import { RecipeSuggestion, SearchQueryBuilder } from '@/app/search';

const router = useIonRouter()
const recipeStore = useRecipeStore()

const itemsById = computed(() => recipeStore.getItemsAsMap)
const items = computed<Item[]>(() => Object.values(itemsById.value ?? {}))
const recipes = computed(() => recipeStore.getRecipesAsList)

const props = defineProps({
    state: {
        type: Boolean, required: true,
    },
})
const {state} = toRefs(props)

/* Emit events */
const emit = defineEmits({
    'update:state': (value: boolean) => value,
    'selectTag': (tag: string) => tag,
    'selectItem': (item: Item) => item,
    'selectPreferences': (value: boolean) => value,
    'search': (value: RecipeSuggestion[]) => value,
})

///////// SEARCHBAR //////////
/* Searchbar configuration */
const SEARCHBAR_CONFIGURATION = {
    MAX_ITEMS: 3, MAX_TAGS: 6, MAX_RECIPES: 6, MIN_SAVED_RECIPES: 3, MAX_TIME: 65, MIN_TIME: 5, STEP_TIME: 5,
}

/* Searchbar state */
const searchbar = ref(null)
const searchbarInput = ref(null)
const preferencesOpen = ref(false)
const resultsOpen = ref(false)
const openPreferences = () => {
    preferencesOpen.value = true
    emit('update:state', true)
}
const closePreferences = () => preferencesOpen.value = false
const openAll = () => {
    preferencesOpen.value = true
    resultsOpen.value = true
    searchbarInput.value?.focus()
}
const closeAll = () => {
    closePreferences()
    resultsOpen.value = false
    emit('update:state', false)
}
watch(state, (newValue, oldValue) => {
    if (newValue !== oldValue) {
        if (newValue) {
            openAll()
        } else {
            closeAll()
        }
    }
})
onClickOutside(searchbar, event => {
    closeAll()
})

///////// SEARCH AND FILTER //////////
const itemSuggestions = computed<Item[]>(() => recipeStore.getItemSuggestions.slice(0, SEARCHBAR_CONFIGURATION.MAX_ITEMS))
const savedRecipes = computed<Recipe[]>(() => recipeStore.getSavedRecipes.slice(0, SEARCHBAR_CONFIGURATION.MAX_RECIPES))
const recipeSuggestions = computed<Recipe[]>(() => recipeStore.getRecipePredictions.slice(0, SEARCHBAR_CONFIGURATION.MAX_RECIPES))
const customTags: {
    name: string, color?: string, func?: () => void,
}[] = [{
    name: 'fast & cheap', color: 'success', func: () => {
        USER_PREFERENCES.value.timeAvailable = 20
        USER_PREFERENCES.value.servings = 2
    },
}, {
    name: 'healthy', color: 'warning',
}, {
    name: 'vegan', color: 'tertiary',
}, {
    name: 'vegetarian', color: 'tertiary',
}, {
    name: 'low carb', color: 'tertiary',
}, {
    name: 'low fat', color: 'tertiary',
}, {
    name: 'low sugar', color: 'tertiary',
}, {
    name: 'low salt', color: 'tertiary',
}, {
    name: 'low calorie', color: 'tertiary',
}, {
    name: 'low cholesterol', color: 'tertiary',
}, {
    name: 'low histamine', color: 'tertiary',
}, {
    name: 'low fodmap', color: 'tertiary',
}, {
    name: 'gluten free', color: 'tertiary',
}, {
    name: 'lactose free', color: 'tertiary',
}, {
    name: 'egg free', color: 'tertiary',
}, {
    name: 'nut free', color: 'tertiary',
}, {
    name: 'soy free', color: 'tertiary',
}, {
    name: 'fish free', color: 'tertiary',
}, {
    name: 'shellfish free', color: 'tertiary',
}, {
    name: 'pork free', color: 'tertiary',
}, {
    name: 'red meat free', color: 'tertiary',
}, {
    name: 'crustacean free', color: 'tertiary',
}, {
    name: 'celery free', color: 'tertiary',
}, {
    name: 'mustard free', color: 'tertiary',
}, {
    name: 'sesame free', color: 'tertiary',
}, {
    name: 'lupine free', color: 'tertiary',
}, {
    name: 'mollusk free', color: 'tertiary',
}, {
    name: 'alcohol free', color: 'tertiary',
}, {
    name: 'kosher',
}]
const suggestedTags = computed(() => [...recipeStore.getTags, ...customTags]
    .filter((tag: string | { name: string }) => {
        return !USER_PREFERENCES_COMPUTED.value.tags.includes(typeof tag === 'string' ? tag : tag.name)
    })
    .slice(0, 3))

/* Search and filter */
const USER_PREFERENCES = ref<{
    timeAvailable: number, servings: number, items: { [id: string]: boolean }, tags: Set<string>,
}>({
    timeAvailable: SEARCHBAR_CONFIGURATION.MAX_TIME, servings: 2, items: {}, tags: new Set<string>(),
})
const USER_PREFERENCES_COMPUTED = computed(() => {
    const _preferences = USER_PREFERENCES.value
    return {
        timeAvailable: _preferences.timeAvailable,
        servings: _preferences.servings,
        items: Object.keys(_preferences.items),
        tags: [..._preferences.tags],
    }
})

/* Quick Filter */
const filterInput = ref('')
const filteredRecipes = ref<Recipe[]>([])
const filteredItems = ref<Item[]>([])
const filteredTags = ref<string[]>([])
watch(filterInput, () => {
    // Reset filtered recipes and items if search input is empty
    if (filterInput.value === '') {
        filteredRecipes.value = []
        filteredItems.value = []
        filteredTags.value = []
        return
    }

    /* Filter recipes and items */
    /* Recipes */
    filteredRecipes.value = searchRecipesByQuery(filterInput.value ?? '')
        .slice(0, SEARCHBAR_CONFIGURATION.MAX_RECIPES)

    /* Items */
    filteredItems.value = items.value
        .filter((item) => item.hasName(filterInput.value ?? ''))
        .filter((item: Item) => typeof USER_PREFERENCES.value.items[item.getId()] === 'undefined')
        .slice(0, SEARCHBAR_CONFIGURATION.MAX_ITEMS)

    /* Tags */
    filteredTags.value = recipeStore.getTags
        .filter((tag: string) => tag.toLowerCase().includes(filterInput.value.toLowerCase()))
        .slice(0, SEARCHBAR_CONFIGURATION.MAX_TAGS)
}, {immediate: true})


const selectedItems = computed<Item[]>(() => Object.keys(USER_PREFERENCES.value.items)
    .map((id: string) => itemsById?.value[id]))
const includeItem = (item?: Item) => USER_PREFERENCES.value.items[item?.getId() ?? ''] = true
const excludeItem = (item?: Item) => USER_PREFERENCES.value.items[item?.getId() ?? ''] = false
const removeItem = (item?: Item) => delete USER_PREFERENCES.value.items[item?.getId() ?? '']
const includeTag = (tag: string) => USER_PREFERENCES.value.tags.add(tag)

/* Search */
const searchedRecipes = ref<RecipeSuggestion[]>([])
const search = () => {
    const searchQueryBuilder = new SearchQueryBuilder()
    searchQueryBuilder.setDuration(USER_PREFERENCES.value.timeAvailable)
    // searchQueryBuilder.setServings(USER_PREFERENCES.value.servings)
    // searchQueryBuilder.setItemIds(itemQueries.value)
    searchQueryBuilder.setTags(USER_PREFERENCES_COMPUTED.value.tags)

    // TODO: fix price calculation
    // searchQueryBuilder.setPrice(maxPrice.value)

    // TODO: enable city index
    //searchQueryBuilder.setCity(city.value)

    const query = searchQueryBuilder.build()
    searchedRecipes.value = searchRecipes(query)
    closeAll()
    emit('search', searchedRecipes.value)
}

/**
 * Select recipe and close list
 */
const selectRecipe = (recipe: Recipe) => {
    closeAll()
    if (recipe) {
        router.push(recipe.getRoute())
    }
}
</script>

<style scoped>
.searchbar-wrapper {
    width: 100%;
    height: 100%;
    transition: var(--transition);
}

.searchbar-wrapper.active {
    background-color: rgba(var(--ion-background-color-rgb), 0.9);
    z-index: 100;
    top: 0;
}

@media (max-width: 768px) {
    .searchbar-wrapper.active {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;

        padding: var(--margin-page);
        background-color: var(--ion-background-color);
    }
}

.searchbar-blur {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;

    /* Background blur */
    backdrop-filter: blur(15px); /* Blur effect */
    mask-image: linear-gradient(180deg, #fff 50%, #0000 90%);

    /* WebKit */
    -webkit-backdrop-filter: blur(15px); /* For WebKit/Safari */

    /* Padding to prevent the blur from being clipped */
    padding: 10px;
}

.searchbar-search-wrapper {
    position: relative;
    z-index: 1;

    /* Flexbox */
    display: flex;
    gap: 10px; /* Added gap between input and button */
    align-items: center;

    /* Basic styling */
    border: var(--border);
    border-color: var(--ion-color-primary);
    border-radius: var(--border-radius-strong);
    padding: 5px 10px;
    max-width: 100%;
    margin: var(--margin) 0;

    /* Colors and shadows */
    box-shadow: var(--box-shadow-neumorphism);

    /* Background blur */
    background-color: rgba(var(--ion-background-color-rgb), 0.9);
    -webkit-backdrop-filter: blur(20px);
    backdrop-filter: blur(20px);

    /* Animations */
    transition: var(--transition);
}

.searchbar-search-wrapper.active {
    box-shadow: var(--box-shadow-neumorphism-pressed);
    transform: none;
}

.searchbar-search {
    border: none;
    outline: none;
    font-size: 16px;
    flex-grow: 1;
    padding: 10px;
    border-radius: var(--border-radius-strong);
    background: none;
    cursor: pointer;
    color: var(--ion-text-color);
}

.searchbar-search-wrapper.active .searchbar-search {
    cursor: text;
}

@media (max-width: 768px) {
    .searchbar-search::placeholder, .searchbar-search::-webkit-input-placeholder {
        font-size: var(--font-size-smaller);
    }
}

/* Extra styling to remove spinner on number inputs in Firefox */
input[type='number'] {
    -moz-appearance: textfield;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.searchbar-button {
    /* Basic styling */
    display: inline-block;
    padding: 10px 20px;
    font-size: 16px;
    font-weight: var(--font-weight-bold);

    text-align: center;
    text-decoration: none;
    border: none;
    border-radius: 50px;
    cursor: pointer;

    /* Colors and shadows */
    color: #fff;
    background-size: 200% 200%; /* Increase background size for the gradient animation */

    /* Shadows */
    box-shadow: var(--box-shadow);

    /* Animations */
    transition: background 1s ease-in-out,
    transform ease-in-out 300ms,
    box-shadow ease-in-out 300ms,
    scale ease-in-out 300ms;
}

.searchbar-button.search {
    background: radial-gradient(circle at top left, #ffc718, #c362b5, #6ab1e1);
}

.searchbar-button.disabled {
    opacity: 0.5;
    pointer-events: none;
    background: none;
    color: inherit;
    border: none;
    box-shadow: none;
}

.searchbar-button:hover, .searchbar-button:active {
    scale: 1.05;
}

.searchbar-list-wrapper {
    position: absolute;
    left: 0;
    z-index: 110;
    width: 100%;
}

.searchbar-quick-preferences {
    width: 100%;
    max-width: var(--max-width);
    margin: var(--margin-auto);
}

.searchbar-list {
    /* Layout */
    width: 100%;
    max-width: var(--max-width);
    margin: var(--margin-auto);
    max-height: 90vh;
    overflow-y: scroll;
    padding: var(--padding-small);

    /* Colors */
    background: var(--ion-background-color);

    /* Borders */
    border-radius: var(--border-radius);

    /* Shadows */
    box-shadow: var(--box-shadow-strong);
}

@media (max-width: 768px) {
    .searchbar-list {
        box-shadow: none;
    }
}
</style>