/*
 * Copyright (c) 2023-2024 Josef Müller.
 */

import { Recipe } from '@/shared/types'
import { useRecipeStore } from '@/app/storage';
import { median } from '@/app/search/util';
import { logDebug } from '@/shared/utils/logging';

const MODULE = 'app.search.suggestion.'

/**
 * Very simple function to predict recipes
 * depending on the following params:
 * - duration
 * - number of steps
 * - items used
 *
 * of liked recipes
 *
 * It's a really simple function that can be improved
 * @param maxRecipes maximum number of recipes to return
 */
export function simpleRecipeSuggestion(maxRecipes = 10): Recipe[] {
    const fName = MODULE + simpleRecipeSuggestion.name

    const store = useRecipeStore()
    const savedKeyValues = store.getSavedRecipesStats
    const recipes = store.getRecipesAsList

    // Sorted by the number of times the item is used in recipes
    // const sortedItemIds: string[] = [...savedKeyValues.itemsIds.entries()].sort((a, b) => b[1] - a[1]).map((item) => item[0])
    // Use the median to avoid outliers
    const duration: number = median(savedKeyValues.duration)
    // const numberOfSteps: number = median(savedKeyValues.numberOfSteps)

    const percentages: {
        duration: number, numberOfSteps: number
        items: number
    } = {
        duration: 0.05, numberOfSteps: 0.05, items: 0.05
    }

    // Filter recipes by duration and number of steps
    const suggestRecipes = (recipes: Recipe[], percentages: {
        duration: number, numberOfSteps: number
        items: number
    }) => {
        return recipes.filter((recipe: Recipe) => {
            const recipeDuration = recipe.getDuration()
            // const recipeNumberOfSteps = recipe.steps.length
            // const recipeItemIds = recipe.getItems().map((item) => item.getId())

            // Filter recipes by duration
            const durationOk: boolean = duration * (1 + percentages.duration) >= recipeDuration && recipeDuration >=
                (duration * (1 - percentages.duration))
            logDebug(fName, 'durationOk', durationOk)
            // Filter recipes by number of steps
            // const numberOfStepsOk: boolean = recipeNumberOfSteps <= numberOfSteps * (1 + percentages.numberOfSteps) && recipeNumberOfSteps >= numberOfSteps * (1 - percentages.numberOfSteps)
            // Filter recipes by ingredients
            // const numberOfItemsInRecipe = recipeItemIds.filter((itemId) => sortedItemIds.includes(itemId)).length
            // const itemsOk: boolean = numberOfItemsInRecipe >= recipeItemIds.length * (1 - percentages.items)

            return durationOk
        })
    }

    // Train function
    const train = (recipes: Recipe[], learningRate = 0.1) => {
        // const suggestedRecipes = suggestRecipes(recipes, percentages)
        // Update percentages
        percentages.duration += learningRate
        percentages.numberOfSteps += learningRate
        percentages.items += learningRate
    }

    // Train the model until we have enough recipes
    let suggestedRecipes: Recipe[] = []
    let maxIterations = 100
    while (suggestedRecipes.length < maxRecipes && maxIterations-- > 0) {
        train(suggestedRecipes)
        suggestedRecipes = suggestRecipes(recipes, percentages)
    }

    logDebug(fName, 'percentages', percentages)
    logDebug(fName, 'suggestedRecipes', suggestedRecipes)
    return suggestedRecipes.slice(0, maxRecipes)
}