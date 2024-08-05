/*
 * Copyright (c) 2024 Josef Müller.
 */

import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { API_ROUTE, APIResponse, Ingredient, presentToast, Recipe, sendToAPI } from '@/shared'
import { logDebug } from '@/shared/utils/logging'
import { MutableRecipe } from '@/editor/models/recipe'
import { MutableIngredient } from '@/editor/models/ingredient.ts'

const MODULE = 'editor.storage.recipe.'

export const useRecipeEditorStore = defineStore('recipes-editor', () => {
    // State
    const loading = ref<{ [key: string]: boolean }>({ initial: true })
    const recipes = ref<{ [id: string]: MutableRecipe }>({})
    const ingredients = ref<{ [id: string]: MutableIngredient }>({})

    // Getters
    const isLoading = computed(() => Object.values(loading.value).some((isLoading: boolean) => isLoading))
    const isLoadingInitial = computed(() => loading.value.initial)

    const getRecipesAsList = computed(() => {
        const recipesAsList = Object.values(recipes.value ?? {})
        return recipesAsList.length === 0 ? [] : recipesAsList
    })

    const getRecipesAsMap = computed(() => recipes.value ?? {})

    const getRecipesByItemIds = computed(() => {
        const recipesByItemId: { [key: string]: string[] } = {}
        for (const recipe of getRecipesAsList.value) {
            const recipeItems = recipe.getRecipeIngredients()
            for (const recipeItem of recipeItems) {
                if (!(recipeItem.getId() in recipesByItemId)) {
                    recipesByItemId[recipeItem.getId()] = []
                }
                recipesByItemId[recipeItem.getId()].push(recipe.getId())
            }
        }
        logDebug(MODULE + 'getRecipesByItemIds', recipesByItemId)
        return recipesByItemId
    })

    const getItemsAsList = computed(() => Object.values(ingredients.value ?? {}) ?? [])

    const getItemNamesAsList = computed(() =>
        getItemsAsList.value.flatMap((item: MutableIngredient) => item.name.getAll())
    )

    const getItemIdsToName = computed(() =>
        getItemsAsList.value.reduce((map: { [id: string]: string }, item: MutableIngredient) => {
            map[item.getId()] = item.getName()
            return map
        }, {})
    )

    const getItemsSortedByName = computed(() =>
        [...getItemsAsList.value].sort((a: MutableIngredient, b: MutableIngredient) =>
            a.getName().localeCompare(b.getName())
        )
    )

    const getItemsAsMap = computed(() => ingredients.value ?? {})

    const getTags = computed(() =>
        [...new Set(getRecipesAsList.value.reduce((tags: string[], recipe: MutableRecipe) =>
            [...tags, ...(recipe.props.tags ?? [])], []
        ))]
    )

    // Actions
    function deleteItems(itemsToDelete?: MutableIngredient[] | MutableIngredient) {
        if (typeof itemsToDelete === 'undefined') {
            itemsToDelete = Object.values(getItemsAsMap.value)
        }
        if (!Array.isArray(itemsToDelete)) {
            itemsToDelete = [itemsToDelete]
        }

        const itemIds = itemsToDelete.map((item: MutableIngredient) => item.getId())
        itemIds.forEach((itemId: string) => {
            delete ingredients.value[itemId]
        })
        logDebug('deleteItems', itemIds)
        setLoadingState('deleteItems')
        return sendToAPI<string>(API_ROUTE.DELETE_INGREDIENTS, {
            errorMessage: 'Could not delete ingredients from database. Please retry later!',
            body: itemIds
        }).then((apiResponse: APIResponse<string>) => {
            finishLoading('deleteItems')
            return presentToast(apiResponse.response)
        })
    }

    function deleteRecipes(recipesToDelete?: MutableRecipe[] | MutableRecipe) {
        if (typeof recipesToDelete === 'undefined') {
            recipesToDelete = Object.values(getRecipesAsMap.value)
        }
        if (!Array.isArray(recipesToDelete)) {
            recipesToDelete = [recipesToDelete]
        }

        const recipeIds = recipesToDelete.map((recipe: MutableRecipe) => recipe.getId())
        recipeIds.forEach((recipeId: string) => {
            delete recipes.value[recipeId]
        })
        logDebug('deleteRecipes', recipeIds)
        setLoadingState('deleteRecipes')
        return sendToAPI<string>(API_ROUTE.DELETE_RECIPES, {
            errorMessage: 'Could not delete recipes from database. Please retry later!',
            body: recipeIds
        }).then((apiResponse: APIResponse<string>) => {
            finishLoading('deleteRecipes')
            return presentToast(apiResponse.response)
        })
    }

    function fetchItems(): Promise<MutableIngredient[]> {
        logDebug('fetchItems', 'fetching ingredients')
        setLoadingState('fetchItems')
        return sendToAPI<MutableIngredient[]>(API_ROUTE.GET_INGREDIENTS, { errorMessage: 'Could not fetch ingredients' })
            .then((apiResponse: APIResponse<MutableIngredient[]>) => {
                if (!apiResponse.error) {
                    const fetchedItems: MutableIngredient[] = apiResponse.response.map((item: MutableIngredient) => new MutableIngredient(Ingredient.fromJSON(item)))
                    setItems(fetchedItems)
                }
                finishLoading('fetchItems')
                return apiResponse.response
            })
    }

    function fetchRecipes(): Promise<MutableRecipe[]> {
        logDebug('fetchRecipes', 'fetching recipes')
        setLoadingState('fetchRecipes')
        return sendToAPI<MutableRecipe[]>(API_ROUTE.GET_RECIPES, { errorMessage: 'Could not fetch recipes' })
            .then(async (apiResponse: APIResponse<MutableRecipe[]>) => {
                if (!apiResponse.error) {
                    const fetchedRecipes = await Promise.all(apiResponse.response.map((recipe: MutableRecipe) => Recipe.fromJSON(recipe)))
                    return replaceRecipes(fetchedRecipes.map((recipe: Recipe) => new MutableRecipe(recipe)))
                }
                return apiResponse.response
            }).then((fetchedRecipes: MutableRecipe[]) => {
                finishLoading('fetchRecipes')
                return fetchedRecipes
            })
    }

    function finishLoading(key: string) {
        logDebug('finishLoading', key)
        loading.value[key] = false
    }

    function getRecipesAsListByItemId(itemId?: string): string[] {
        return getRecipesByItemIds.value[itemId ?? ''] ?? []
    }

    function prepare() {
        if (!isLoadingInitial.value) {
            return Promise.resolve()
        }
        return fetchItems().then(() => fetchRecipes()).then(() => {
            finishLoading('initial')
        })
    }

    function removeItem(item: MutableIngredient) {
        delete ingredients.value[item.getId()]
    }

    function replaceItems(newItems: MutableIngredient[]) {
        ingredients.value = Object.assign({}, ...newItems.map((item: MutableIngredient) => ({ [item.getId()]: item })))
        return newItems
    }

    function replaceRecipes(newRecipes: MutableRecipe[]) {
        recipes.value = Object.assign({}, ...newRecipes.map((recipe: MutableRecipe) => ({ [recipe.getId()]: recipe })))
        return newRecipes
    }

    function saveItems(itemsToSave?: MutableIngredient[] | MutableIngredient) {
        if (typeof itemsToSave === 'undefined') {
            itemsToSave = Object.values(getItemsAsMap.value)
        }
        if (!Array.isArray(itemsToSave)) {
            itemsToSave = [itemsToSave]
        }

        logDebug('saveItem', itemsToSave)
        setLoadingState('saveItem')
        return sendToAPI<string>(API_ROUTE.ADD_INGREDIENTS, {
            body: itemsToSave,
            errorMessage: 'Could not save ingredients in database. Please retry later!'
        })
            .then((apiResponse: APIResponse<string>) => {
                finishLoading('saveItem')
                return apiResponse
            })
            .then((apiResponse: APIResponse<string>) => {
                if (!apiResponse.error) {
                    return fetchItems()
                }
                return []
            })
            .catch(() => setItems(itemsToSave))
    }

    function saveRecipes(recipesToSave?: MutableRecipe[] | MutableRecipe) {
        if (typeof recipesToSave === 'undefined') {
            recipesToSave = Object.values(getRecipesAsMap.value)
        }
        if (!Array.isArray(recipesToSave)) {
            recipesToSave = [recipesToSave]
        }

        logDebug('saveRecipe', recipesToSave)
        setLoadingState('saveRecipe')
        return sendToAPI<string>(API_ROUTE.ADD_RECIPES, {
            body: recipesToSave,
            errorMessage: 'Could not save recipe in database. Please retry later!',
            successMessage: 'Updated recipe'
        })
            .then((apiResponse: APIResponse<string>) => {
                finishLoading('saveRecipe')
                return apiResponse
            })
            .then((apiResponse: APIResponse<string>) => {
                if (!apiResponse.error) {
                    return fetchItems().then(() => fetchRecipes())
                }
                return []
            })
            .catch(() => setRecipes(recipesToSave))
    }

    function setItem(item: MutableIngredient) {
        ingredients.value[item.getId()] = item
    }

    function setItems(newItems?: MutableIngredient[] | MutableIngredient) {
        if (typeof newItems === 'undefined') {
            ingredients.value = {}
            return Promise.resolve([])
        }

        if (!Array.isArray(newItems)) {
            ingredients.value[newItems.getId()] = newItems
        } else {
            ingredients.value = Object.assign(ingredients.value, ...newItems.map((item: MutableIngredient) => ({ [item.getId()]: item })))
        }
        return Promise.resolve(newItems)
    }

    function setLoadingState(key: string) {
        loading.value[key] = true
    }

    function setRecipes(newRecipes?: MutableRecipe[] | MutableRecipe) {
        if (typeof newRecipes === 'undefined') {
            recipes.value = {}
            return Promise.resolve([])
        }

        if (!Array.isArray(newRecipes)) {
            recipes.value[newRecipes.getId()] = newRecipes
        } else {
            recipes.value = Object.assign(recipes.value, ...newRecipes.map((recipe: MutableRecipe) => ({ [recipe.getId()]: recipe })))
        }
        return Promise.resolve(newRecipes)
    }

    return {
        loading,
        recipes,
        ingredients,
        isLoading,
        isLoadingInitial,
        getRecipesAsList,
        getRecipesAsMap,
        getRecipesByItemIds,
        getItemsAsList,
        getItemNamesAsList,
        getItemIdsToName,
        getItemsSortedByName,
        getItemsAsMap,
        getTags,
        deleteItems,
        deleteRecipes,
        fetchItems,
        fetchRecipes,
        finishLoading,
        getRecipesAsListByItemId,
        prepare,
        removeItem,
        replaceItems,
        replaceRecipes,
        saveItems,
        saveRecipes,
        setItem,
        setItems,
        setLoadingState,
        setRecipes
    }
})
