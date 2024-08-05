/*
 * Copyright (c) 2024 Josef Müller.
 */

import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { Ingredient, Recipe, RecipeIngredient } from '@/shared'
import { TasteBuddySearch } from '@/app/search/search.ts'
import { useSharedRecipeStore } from '@/shared/storage/recipe.ts'
import { CachedItem, getCachedItem, setCachedItem } from '@/shared/storage/cache.ts'
import { simpleRecipeSuggestion } from '@/app/search/suggestion.ts'
import { logDebug } from '@/shared/utils/logging.ts'

const MODULE = 'app.storage.recipe.'

export const useRecipeStore = defineStore('recipes-app', () => {
    // State
    const _recipePredictions = ref<Recipe[]>([])
    const _savedRecipes = ref<Set<string>>(new Set())
    const search = ref<TasteBuddySearch | null>(null)
    const config = ref({
        numberOfPredictions: 10
    })

    // Getters
    const ingredientSuggestions = computed(() => {
        const sharedRecipeStore = useSharedRecipeStore()
        const randomItems: Ingredient[] = sharedRecipeStore.ingredients.filter(() => Math.random() < 0.5)

        const itemsFromSavedRecipes: Ingredient[] = savedRecipes.value.reduce((items: Ingredient[], recipe: Recipe) => {
            const recipeItems: Ingredient[] = recipe.getRecipeIngredients().map((item: RecipeIngredient) => sharedRecipeStore.ingredientMap[item.getId()])
            return [...items, ...recipeItems]
        }, [])

        const itemIds = new Set([...randomItems, ...itemsFromSavedRecipes].map((item: Ingredient) => item.getId()))
        return [...itemIds].map((itemId: string) => sharedRecipeStore.ingredientMap[itemId]).filter((item: Ingredient) => typeof item !== 'undefined')
    })

    const ingredients = computed(() => {
        const sharedRecipeStore = useSharedRecipeStore()
        return sharedRecipeStore.ingredients
    })

    const ingredientMap = computed(() => {
        const sharedRecipeStore = useSharedRecipeStore()
        return sharedRecipeStore.ingredientMap
    })

    const recipeOfTheDay = computed(() => {
        const now: Date = new Date()
        const start: Date = new Date(now.getFullYear(), 0, 0)
        const diff: number = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000)
        const oneDay: number = 1000 * 60 * 60 * 24
        const day: number = Math.floor(diff / oneDay)

        let state = 5021 % 2147483647
        if (state <= 0) {
            state += 2147483646
        }

        const getRandom = () => {
            state = (state * 16807) % 2147483647
            return (state - 1) / 2147483646
        }
        const randSortedRecipesAsList = recipes.value.toSorted(() => getRandom() - 0.5)

        return randSortedRecipesAsList[day % randSortedRecipesAsList.length]
    })

    const recipePredictions = computed(() => _recipePredictions.value ?? [])

    const recipes = computed(() => {
        const sharedRecipeStore = useSharedRecipeStore()
        return sharedRecipeStore.recipes
    })

    const recipeMap = computed(() => {
        const sharedRecipeStore = useSharedRecipeStore()
        return sharedRecipeStore.recipeMap
    })

    const savedRecipeStats = computed(() => {
        const keyValues: {
            numberOfSteps: number[],
            numberOfIngredients: number[],
            duration: number[],
            itemsIds: Map<string, number>
        } = {
            numberOfSteps: [], numberOfIngredients: [], duration: [], itemsIds: new Map()
        }
        const savedRecipesList = savedRecipes.value
        for (const savedRecipe of savedRecipesList) {
            keyValues.numberOfSteps.push(savedRecipe.steps.length)
            keyValues.numberOfIngredients.push(savedRecipe.getRecipeIngredients().length)
            keyValues.duration.push(savedRecipe.getDuration())
            for (const item of savedRecipe.getRecipeIngredients()) {
                const count = keyValues.itemsIds.get(item.getId()) ?? 0
                keyValues.itemsIds.set(item.getId(), count + 1)
            }
        }

        return keyValues
    })

    const savedRecipeIds = computed(() => [..._savedRecipes.value])

    const savedRecipes = computed(() =>
        [..._savedRecipes.value].reduce((recipes: Recipe[], recipeId: string) => {
            if (recipeId in recipeMap.value) {
                recipes.push(recipeMap.value[recipeId])
            }
            return recipes
        }, [])
    )
    const savedRecipeMap = computed(() =>
        [..._savedRecipes.value].reduce((recipes: { [id: string]: Recipe }, recipeId) => {
            recipes[recipeId] = recipeMap.value[recipeId]
            return recipes
        }, {})
    )

    const tags = computed(() =>
        [...new Set(recipes.value.reduce((tags: string[], recipe: Recipe) =>
            [...tags, ...(recipe.props.tags ?? [])], [])
        )]
    )

    // Actions
    function prepareSearch() {
        search.value = new TasteBuddySearch(recipes.value)
    }

    async function prepareStore() {
        return useSharedRecipeStore().prepareStore()
            .then(() => getCachedItem<string[]>('savedRecipes', []))
            .then((savedRecipesCache: CachedItem<string[]>) => setSavedRecipes(savedRecipesCache.value ?? []))
            .then(() => prepareSearch())
    }

    function setSaved(recipe: Recipe) {
        if (!_savedRecipes.value.has(recipe.getId())) {
            _savedRecipes.value.add(recipe.getId())
        } else {
            _savedRecipes.value.delete(recipe.getId())
        }

        updateRecipePredictions()
        return setCachedItem('savedRecipes', [...savedRecipes.value])
    }

    function setSavedRecipes(newSavedRecipes: string[]) {
        _savedRecipes.value = new Set(newSavedRecipes)
        updateRecipePredictions()
        return setCachedItem('savedRecipes', [...savedRecipes.value])
    }

    function updateRecipePredictions() {
        const predictedRecipes = simpleRecipeSuggestion(config.value.numberOfPredictions)
        logDebug(MODULE + updateRecipePredictions.name, predictedRecipes)
        _recipePredictions.value = predictedRecipes
    }

    return {
        recipePredictions,
        savedRecipes,
        search,
        config,
        ingredientSuggestions,
        ingredients,
        ingredientMap,
        recipeOfTheDay,
        recipes,
        recipeMap,
        savedRecipeStats,
        savedRecipeIds,
        savedRecipeMap,
        tags,
        prepareStore,
        setSaved,
        setSavedRecipes
    }
})
