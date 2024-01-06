<!--
  - Copyright (c) 2023-2024 Josef Müller.
  -->

<template>
    <div class="searchbar-wrapper">
        <div ref="searchbar">
            <!-- <div v-if="!searchbarIsOpen" class="dummy-searchbar" >
                Suche nach Rezepten, Zutaten, Tags...
            </div> -->
            <div class="searchbar-search-wrapper">
                <IonSearchbar v-model="searchInput" :animated="true" :clear-icon="undefined"
                              :debounce="100" :placeholder="placeholder" :search-icon="undefined"
                              class="searchbar-search" enterkeyhint="enter"
                              inputmode="text" type="text" @click="openSearch()"
                              @ionClear="searchInput = ''" @keydown.esc="closeSearch()"/>
                <IonButton class="smart-search-button" shape="round" size="small" @click="search">
                    <IonIcon :icon="searchOutline"/>
                </IonButton>
            </div>
            <div v-show="searchbarIsOpen" class="searchbar-list-wrapper">
                <div class="searchbar-list">
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


                    <IonItem lines="none">
                        <h3>Was darf's sein?</h3>
                    </IonItem>

                    <IonItem v-if="savedRecipes?.length > CONFIG.MIN_SAVED_RECIPES && filteredRecipes?.length == 0"
                             lines="none">
                        <h4>Deine gespeicherten Rezepte</h4>
                        <HorizontalList :list="savedRecipes" no-wrap>
                            <template #element="{element}">
                                <MiniRecipePreview :name="element.getName()" :recipe="element"
                                                   @click="selectRecipe(element)"/>
                            </template>
                        </HorizontalList>
                    </IonItem>
                    <IonItem v-if="filteredRecipes?.length > 0" lines="none">
                        <h4>Rezepte</h4>
                        <HorizontalList :list="filteredRecipes" no-wrap>
                            <template #element="{element}">
                                <MiniRecipePreview :name="element.getName()" :recipe="element"
                                                   @click="selectRecipe(element)"/>
                            </template>
                        </HorizontalList>
                    </IonItem>

                    <IonItem v-if="filteredItems?.length > 0" lines="none">
                        <h4>Wähle Zutaten aus</h4>
                        <HorizontalList :list="[...filteredItems, /*...itemSuggestions */]" no-wrap>
                            <template #element="{element}">
                                <ItemChip :item="element" @click="selectItem(element)"/>
                            </template>
                        </HorizontalList>
                    </IonItem>
                </div>
            </div>
        </div>
    </div>
</template>


<script lang="ts" setup>
import { computed, PropType, ref, shallowRef, toRefs, watch } from 'vue';
import { IonButton, IonIcon, IonItem, IonSearchbar, useIonRouter } from '@ionic/vue';
import { HorizontalList, Item, Recipe } from '@/shared';
import { searchRecipesByQuery } from '@/app/search/search.ts';
import { useRecipeStore } from '@/app/storage';
import ItemChip from '@/shared/components/recipe/item/ItemChip.vue';
import { onClickOutside } from '@vueuse/core'
import { searchOutline } from 'ionicons/icons'
import { MiniRecipePreview } from '@/app/components';

const recipeStore = useRecipeStore()

// Props
const props = defineProps({
    placeholder: {
        type: String, required: true
    }, items: {
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

<style>
.searchbar-search {
    --box-shadow: var(--box-shadow-inner);
}
</style>

<style scoped>
.searchbar-wrapper {
    width: 100%;
}

.searchbar-search-wrapper {
    display: flex;
}

.dummy-searchbar {
    background: var(--ion-background-color);
    color: var(--ion-color-medium);

    width: 100%;
    padding: var(--padding);
    height: 50px;

    border: var(--border);
    border-radius: 50px;
}

.searchbar-list-wrapper {
    position: absolute;
    left: 0;
    z-index: 110;
    width: 100%;
}

.searchbar-list {
    width: 90%;
    max-width: var(--max-width);
    margin: var(--margin-auto);
    max-height: 90vh;
    overflow-y: scroll;
    padding: var(--padding-large);
    background: var(--background);
    border: var(--border);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow-strong);
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

.smart-search-button {
    --background: radial-gradient(circle at top left, #62c370, #c362b5, #6ab1e1),
    linear-gradient(45deg, #6ab1e1, #62c370, #c362b5, #6ab1e1),
    radial-gradient(circle at bottom right, #62c370, #c362b5, #6ab1e1),
    linear-gradient(135deg, #6ab1e1, #62c370, #c362b5, #6ab1e1);
    --padding-bottom: 0;
    --padding-top: 0;
    --padding-start: 0;
    --padding-end: 0;
    --ripple-color: transparent;
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
    border-radius: 50px;
    cursor: pointer;

    /* Colors and shadows */
    background: radial-gradient(circle at top left, #62c370, #c362b5, #6ab1e1),
    linear-gradient(45deg, #6ab1e1, #62c370, #c362b5, #6ab1e1),
    radial-gradient(circle at bottom right, #62c370, #c362b5, #6ab1e1),
    linear-gradient(135deg, #6ab1e1, #62c370, #c362b5, #6ab1e1);
    color: #fff;
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
    scale: 1.05;
}
</style>