<!--
  - Copyright (c) 2023-2024 Josef Müller.
  -->

<template>
    <div class="searchbar-wrapper">
        <div ref="searchbar">
            <div class="searchbar-blur"/>
            <div :class="['searchbar-search-wrapper', {'active': searchbarIsOpen}]">
                <input v-model="searchInput" :placeholder="$t('Suggestions.SearchbarPrompt')"
                       class="searchbar-search"
                       @click="openSearch()"
                       @ionClear="searchInput = ''" @keydown.esc="closeSearch()"/>
                <button class="searchbar-search-button" @click="search">
                    <IonIcon :icon="searchOutline"/>
                </button>
            </div>

            <Transition name="fade-top">
                <div v-show="searchbarIsOpen" class="searchbar-quick-preferences">
                    <!-- Quick-Questions -->
                    <QuickPreferenceContainer>
                        <QuickPreference>
                            <template #title><span class="highlight">
                                {{
                                    USER_PREFERENCES.timeAvailable >
                                        60 ? 'viiiel' : `${USER_PREFERENCES.timeAvailable} Minuten`
                                }} </span>
                                Kochzeit
                            </template>
                            <!-- TODO: add logarithmic slider -->
                            <template #default>
                                <IonRange v-model="USER_PREFERENCES.timeAvailable"
                                          :max="65" :min="10"
                                          :step="5"
                                          pin snaps/>
                            </template>
                        </QuickPreference>

                        <!-- TODO: add skip button -->
                        <!-- Is this really necessary? -->

                        <QuickPreference>
                            <template #title><span class="highlight">{{
                                USER_PREFERENCES.servings
                            }} Portionen</span>
                            </template>
                            <template #default>
                                <IonRange v-model="USER_PREFERENCES.servings"
                                          :max="10" :min="1"
                                          :step="1" pin snaps/>
                            </template>
                        </QuickPreference>

                        <!-- <QuickItemPreference/> -->
                    </QuickPreferenceContainer>
                </div>
            </Transition>

            <div v-if="searchInput !== '' && searchbarIsOpen" class="searchbar-list-wrapper">
                <div class="searchbar-list">
                    <Transition name="fade-top">
                        <div v-show="searchInput !== ''" class="searchbar-list-results">
                            <!-- TODO:
                                    The behaviour of the searchbar should be that its almost fullscreen
                                    and the user can type in it.

                                    DONE The behaviour should be that the user is shown some suggestions
                                    without having to type anything. The suggestions should be
                                    based on the user's preferences.

                                    The user should be able to select the suggestions and
                                    view them in the searchbar.

                                    The user should be able to see some recipe suggestions based on
                                    the user's preferences.

                                    The user should be able to see some item suggestions based on
                                    the user's preferences.

                                    The user should be able to see some tag suggestions based on
                                    the user's preferences.

                                    The user should be able to select time, temperature and other things
                                    in the searchbar.
                                 -->

                            <IonItem v-if="filteredRecipes?.length === 0 && filteredItems?.length === 0" lines="none">
                                <h4>Vorschläge</h4>
                            </IonItem>
                            <IonItem v-else lines="none">
                                <h4>Deine Suche</h4>
                            </IonItem>
                            <IonItem v-if="filteredItems?.length === 0" lines="none">
                                <HorizontalList :list="itemSuggestions" no-wrap>
                                    <template #element="{element}">
                                        <ItemChip :item="element" @click="selectItem(element)"/>
                                    </template>
                                </HorizontalList>
                            </IonItem>
                            <IonItem v-if="filteredRecipes?.length === 0" lines="none">
                                <HorizontalList :list="recipeSuggestions" no-wrap>
                                    <template #element="{element}">
                                        <MiniRecipePreview :img-url="element?.props?.imgUrl"
                                                           :link="element?.getRoute()"
                                                           :name="element?.getName()" :recipe="element"
                                                           @click="selectRecipe(element)"/>
                                    </template>
                                </HorizontalList>
                            </IonItem>


                            <IonItem v-if="filteredItems?.length > 0" lines="none">
                                <HorizontalList :list="[...filteredItems, /*...itemSuggestions */]" no-wrap>
                                    <template #element="{element}">
                                        <ItemChip :item="element" @click="selectItem(element)"/>
                                    </template>
                                </HorizontalList>
                            </IonItem>
                            <IonItem v-if="filteredRecipes?.length > 0" lines="none">
                                <HorizontalList :list="filteredRecipes" no-wrap>
                                    <template #element="{element}">
                                        <MiniRecipePreview :img-url="element?.props?.imgUrl"
                                                           :link="element?.getRoute()"
                                                           :name="element?.getName()" :recipe="element"
                                                           @click="selectRecipe(element)"/>
                                    </template>
                                </HorizontalList>
                            </IonItem>
                        </div>
                    </Transition>
                </div>
            </div>
        </div>
    </div>
</template>


<script lang="ts" setup>
import { computed, PropType, ref, shallowRef, toRefs, Transition, watch } from 'vue';
import { IonIcon, IonItem, IonRange, useIonRouter } from '@ionic/vue';
import { HorizontalList, Item, Recipe } from '@/shared';
import { searchRecipesByQuery } from '@/app/search/search.ts';
import { useRecipeStore } from '@/app/storage';
import ItemChip from '@/shared/components/recipe/item/ItemChip.vue';
import { onClickOutside } from '@vueuse/core'
import { searchOutline } from 'ionicons/icons'
import { MiniRecipePreview } from '@/app/components';
import { QuickPreference, QuickPreferenceContainer } from '@/app/components/search';

const recipeStore = useRecipeStore()

// Props
const props = defineProps({
    items: {
        type: Array as PropType<Item[]>, required: false, default: () => []
    }, recipes: {
        type: Array as PropType<Recipe[]>, required: false, default: () => []
    }, tags: {
        type: Array as PropType<string[]>, required: false, default: () => []
    }
})
const {tags, recipes, items} = toRefs(props);
const router = useIonRouter()

// Emits
const emit = defineEmits({
    'update:modelValue': (value: string) => value,
    'selectTag': (tag: string) => tag,
    'selectItem': (item: Item) => item,
    'selectPreferences': (value: boolean) => value,
    'search': () => true
})

const searchbar = ref(null)

/* Configuration */
const CONFIG = {
    MAX_ITEMS: 3, MAX_TAGS: 6, MAX_RECIPES: 6, MIN_SAVED_RECIPES: 3
}

/* Searchbar state */
const searchInput = ref('')
const searchbarIsOpen = ref(false)
onClickOutside(searchbar, event => {
    searchbarIsOpen.value = false
})

const showPreferences = ref(true)
const USER_PREFERENCES = ref<{
    timeAvailable: number, servings: number, items: Item[], tags: string[],
}>({
    timeAvailable: 5, servings: 2, items: [], tags: [],
})

const selectPreferences = () => {
    closeSearch()
    showPreferences.value = !showPreferences.value
}
watch(showPreferences, (newShowPreferences) => {
    emit('selectPreferences', newShowPreferences)
}, {immediate: true})

/* State whether list should be open */
const listIsOpen = computed<boolean>(() => {
    return ((items.value.length > 0 || tags.value.length > 0 || recipes.value.length > 0) && searchInput.value !== '')
})

watch(searchInput, (newFilterInput) => {
    // Emit new filter input
    emit('update:modelValue', newFilterInput)
})

// Suggestions
const itemSuggestions = computed<Item[]>(() => recipeStore.getItemSuggestions.slice(0, CONFIG.MAX_ITEMS))
const savedRecipes = computed<Recipe[]>(() => recipeStore.getSavedRecipes.slice(0, CONFIG.MAX_RECIPES))
const recipeSuggestions = computed<Recipe[]>(() => recipeStore.getRecipePredictions.slice(0, CONFIG.MAX_RECIPES))

// Filter
const filteredRecipes = shallowRef<Recipe[]>([])
const filteredItems = shallowRef<Item[]>([])

watch(searchInput, () => {
    // Reset filtered recipes and items if search input is empty
    if (searchInput.value === '') {
        filteredRecipes.value = []
        filteredItems.value = []
        return
    }

    // Filter recipes and items
    filteredRecipes.value = searchRecipesByQuery(searchInput.value ?? '')
        .slice(0, CONFIG.MAX_RECIPES)
    filteredItems.value = items.value
        .filter((item) => item.getName().toLowerCase().includes(searchInput.value.toLowerCase()))
        .slice(0, CONFIG.MAX_ITEMS)
})

const routeRecipe = (recipe?: Recipe) => {
    if (recipe) {
        router.push(recipe.getRoute())
    }
}

const openSearch = () => {
    searchbarIsOpen.value = true
}

/**
 * Close list if mouse leaves searchbar and searchbar is not focussed
 * or on "esc" keydown
 */
const closeSearch = () => {
    searchInput.value = ''
}

const selectTag = (tag: string) => {
    emit('selectTag', tag)
    closeSearch()
}

/**
 * Select recipe and close list
 */
const selectRecipe = (recipe: Recipe) => {
    routeRecipe(recipe)
    closeSearch()
}

/**
 * Select item and close list
 */
const selectItem = (item: Item) => {
    emit('selectItem', item)
    closeSearch()
}

const submitted = ref(false)
const search = () => {
    emit('search')
}
</script>

<style scoped>
.searchbar-wrapper {
    width: 100%;
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

@media (max-width: 768px) {
    .searchbar-search::placeholder, .searchbar-search::-webkit-input-placeholder {
        font-size: var(--font-size-smaller);
    }
}

/* .searchbar-quick-preferences {
    margin-bottom: 50px;
} */

/* Extra styling to remove spinner on number inputs in Firefox */
input[type='number'] {
    -moz-appearance: textfield;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
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

.searchbar-search-button {
    /* Basic styling */
    display: inline-block;
    padding: 10px 20px;
    font-size: 16px;
    font-weight: bold;
    text-align: center;
    text-decoration: none;
    border: none;
    border-radius: 50px;
    cursor: pointer;

    /* Colors and shadows */
    background: radial-gradient(circle at top left, #62c370, #c362b5, #6ab1e1),
    linear-gradient(45deg, #6ab1e1, #62c370, #c362b5, #6ab1e1),
    radial-gradient(circle at bottom right, #62c370, #c362b5, #6ab1e1),
    linear-gradient(135deg, #6ab1e1, #62c370, #c362b5, #6ab1e1);
    color: #fff;
    text-shadow: 1px 1px 2px #fff;
    background-size: 200% 200%; /* Increase background size for the gradient animation */

    /* Shadows */
    box-shadow: var(--box-shadow2);

    /* Animations */
    transition: background 1s ease-in-out,
    transform ease-in-out 300ms,
    box-shadow ease-in-out 300ms,
    scale ease-in-out 300ms;
    animation: liquidGradient 5s infinite ease; /* Apply the liquid gradient animation */
}


.searchbar-search-button:hover, .searchbar-search-button:active {
    /* Hover effects */
    box-shadow: 0 30px 20px -15px rgba(0, 0, 0, 0.2);
    text-shadow: none;
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
    width: 100%;
    max-width: var(--max-width);
    margin: var(--margin-auto);
    max-height: 90vh;
    overflow-y: scroll;
    padding: var(--padding-small);
    background: var(--background);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow-strong);
}
</style>