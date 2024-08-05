/*
 * Copyright (c) 2024 Josef Müller.
 */

import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

// Imports (same as original)
import { API_ROUTE, APIResponse, Ingredient, Recipe, sendToAPI } from '@/shared'
import { logDebug } from '@/shared/utils/logging'
import { useSharedStore } from '@/shared/storage/shared.ts'
import { CachedItem, getCachedItem, removeCachedItem, setCachedItem } from '@/shared/storage/cache.ts'

export const useSharedRecipeStore = defineStore('recipes-shared', () => {
    const _ingredientMap = ref<{ [id: string]: Ingredient }>({})
    const ingredients = computed<Ingredient[]>((): Ingredient[] => Object
        .values(_ingredientMap.value ?? {})
        .toSorted((a: Ingredient, b: Ingredient) => a.getName().localeCompare(b.getName())) ?? [])
    const ingredientNames = computed((): string[] => ingredients.value.flatMap((item: Ingredient) => item.name.getAll()))
    const ingredientIdsToName = computed((): { [id: string]: string } =>
        ingredients.value.reduce((map: { [id: string]: string }, item: Ingredient) => {
            map[item.getId()] = item.getName()
            return map
        }, {})
    )
    const ingredientMap = computed((): { [id: string]: Ingredient } => _ingredientMap.value ?? {})

    const _recipeMap = ref<{ [id: string]: Recipe }>({})
    const recipes = computed((): Recipe[] => {
        const recipesAsList = Object.values(_recipeMap.value ?? {})
        return recipesAsList.length === 0 ? [] : recipesAsList
    })
    const recipeMap = computed((): { [id: string]: Recipe } => _recipeMap.value ?? {})


    const tags = computed((): string[] =>
        [...new Set(recipes.value.reduce((tags: string[], recipe: Recipe) =>
            [...tags, ...(recipe.props.tags ?? [])], [])
        )]
    )

    // Actions
    async function fetchItems(): Promise<Ingredient[] | null> {
        const sharedStore = useSharedStore()
        logDebug('fetchItems', 'fetching items')
        sharedStore.startLoading('fetchItems')
        return sendToAPI<Ingredient[]>(API_ROUTE.GET_INGREDIENTS, { errorMessage: 'Could not fetch items' })
            .then((apiResponse: APIResponse<Ingredient[]>) => {
                if (!apiResponse.error) {
                    const fetchedItems: Ingredient[] = apiResponse.response.map((item: Ingredient) => Ingredient.fromJSON(item))
                    setItems(fetchedItems)
                }
                sharedStore.finishLoading('fetchItems')
                return !apiResponse.error ? apiResponse.response : null
            })
    }

    async function fetchRecipes(): Promise<Recipe[] | null> {
        const sharedStore = useSharedStore()
        logDebug('fetchRecipes', 'fetching recipes')
        sharedStore.startLoading('fetchRecipes')
        return sendToAPI<Recipe[]>(API_ROUTE.GET_RECIPES, { errorMessage: 'Could not fetch recipes' })
            .then((apiResponse: APIResponse<Recipe[]>) => {
                if (!apiResponse.error) {
                    const fetchedRecipes: Recipe[] = apiResponse.response.map((recipe: Recipe) => Recipe.fromJSON(recipe))
                    setRecipes(fetchedRecipes)
                }
                sharedStore.finishLoading('fetchRecipes')
                return !apiResponse.error ? apiResponse.response : null
            })
    }

    async function prepareStore() {
        const sharedStore = useSharedStore()

        return getCachedItem<Ingredient[]>('ingredients', [], fetchItems)
            .then((cachedItems: CachedItem<Ingredient[]>) => setItems((cachedItems.value ?? []).map((item: Ingredient) => Ingredient.fromJSON(item))))
            .then(() => getCachedItem<Recipe[]>('recipes', [], fetchRecipes))
            .then((cachedRecipes: CachedItem<Recipe[]>) => setRecipes((cachedRecipes.value ?? []).map((recipe: Recipe) => Recipe.fromJSON(recipe))))
            .then(() => sharedStore.finishLoading('initial'))
    }

    async function resetStore() {
        _recipeMap.value = {}
        _ingredientMap.value = {}
        return Promise.all([removeCachedItem('recipes'), removeCachedItem('ingredients')])
            .then(() => prepareStore())
    }

    function setItems(newItems: Ingredient[], updateCache = true): Promise<Ingredient[]> {
        logDebug('replaceItems', `replacing ${newItems.length} items`)
        _ingredientMap.value = Object.assign({}, ...newItems.map((item: Ingredient) => ({ [item.getId()]: item })))
        if (updateCache) {
            return setCachedItem('ingredients', newItems)
        }
        return Promise.resolve(newItems)
    }

    function setRecipes(newRecipes: Recipe[], updateCache = true): Promise<Recipe[]> {
        logDebug('replaceRecipes', `replacing ${newRecipes.length} recipes`)
        _recipeMap.value = Object.assign({}, ...newRecipes.map((recipe: Recipe) => ({ [recipe.getId()]: recipe })))
        if (updateCache) {
            return setCachedItem('recipes', newRecipes)
        }
        return Promise.resolve(newRecipes)
    }

    return {
        recipes,
        ingredients,
        recipeMap,
        ingredientMap,
        tags,
        fetchItems,
        fetchRecipes,
        prepareStore,
        resetStore,
        setItems,
        setRecipes
    }
})
