<!--
  - Copyright (c) 2023-2024 Josef Müller.
  -->

<template>
    <div class="searchbar-wrapper">
        <div class="searchbar-search-wrapper">
            <IonSearchbar v-model="searchInput" :animated="true" :debounce="100"
                          :placeholder="placeholder" class="searchbar-search" enterkeyhint="enter" inputmode="text"
                          type="text"
                          @click="openSearch()" @ionClear="searchInput = ''" @keydown.esc="closeSearch()"/>
        </div>
        <div v-show="listIsOpen" class="searchbar-list-wrapper">
            <div class="searchbar-list">
                <!-- Suggest items -->
                <IonItem v-if="items?.length > 0">
                    <ItemChip v-for="(item, itemIndex) in items" :key="itemIndex"
                              :item="item" @click="selectItem(item)"/>
                </IonItem>

                <!-- Show search results -->
                <IonList class="ion-no-padding" lines="none">
                    <IonItemGroup v-if="filteredRecipes?.length > 0">
                        <IonItemDivider>
                            <IonLabel>{{ $t('General.Recipe', filteredRecipes?.length) }}</IonLabel>
                        </IonItemDivider>
                        <IonItem v-for="(recipe, recipeIndex) in filteredRecipes" :key="recipeIndex"
                                 button @click="selectRecipe(recipe)">
                            {{ recipe.getName() }}
                        </IonItem>
                    </IonItemGroup>
                    <IonItemGroup v-if="tags?.length > 0">
                        <IonItemDivider>
                            <IonLabel>{{ $t('General.Tag', tags?.length) }}</IonLabel>
                        </IonItemDivider>
                        <IonItem class="over-x-scroll" lines="none">
                            <IonChip v-for="(tag, tagIndex) in tags" :key="tagIndex" button @click="selectTag(tag)">
                                {{ tag }}
                            </IonChip>
                        </IonItem>
                    </IonItemGroup>
                    <IonItemGroup v-if="items?.length > 0">
                        <IonItemDivider>
                            <IonLabel>{{ $t('General.Item', items?.length) }}</IonLabel>
                        </IonItemDivider>
                        <IonItem v-for="(item, itemIndex) in items" :key="itemIndex" button @click="selectItem(item)">
                            {{ item.getName(undefined, 1) }}
                        </IonItem>
                    </IonItemGroup>
                </IonList>
            </div>
        </div>
    </div>
</template>


<script lang="ts" setup>
import { computed, PropType, ref, shallowRef, toRefs, watch } from 'vue';
import {
    IonChip, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonList, IonSearchbar, useIonRouter
} from '@ionic/vue';
import { Item, Recipe } from '@/shared';
import { searchRecipesByString } from '@/app/search/search.ts';
import ItemChip from '@/shared/components/recipe/item/ItemChip.vue';

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
    'selectPreferences': (value: boolean) => value
})

/* Configuration */
const CONFIG = {
    MAX_ITEMS: 6, MAX_TAGS: 6, MAX_RECIPES: 6
}

/* Searchbar state */
const searchInput = ref('')

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

// Filter recipes
const filteredRecipes = shallowRef<Recipe[]>([])
watch(searchInput, () => {
    filteredRecipes.value = searchRecipesByString(searchInput.value ?? '').slice(0, CONFIG.MAX_RECIPES)
})
const routeRecipe = (recipe?: Recipe) => {
    if (recipe) {
        router.push(recipe.getRoute())
    }
}

const openSearch = () => {
    showPreferences.value = true
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
    max-height: 50vh;
    overflow-y: scroll;
    padding: var(--padding-large);
    background: var(--background);
    border: var(--border);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow-strong);
}
</style>