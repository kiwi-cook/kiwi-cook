/*
 * Copyright (c) 2023 Josef Müller.
 */

import { Recipe } from '@/shared';
import { logError } from '@/shared/utils/logging';
import { Ref } from 'vue';

export enum RecipeParser {
    Cookstr = 'cookstr', AllRecipes = 'allrecipes',
}

export const availableParsers: RecipeParser[] = Object.values(RecipeParser)

/**
 * Parses a JSON string into a list of recipes.
 * @param jsonString
 * @param options
 */
export function parseRecipes(jsonString: string, options: { parser: RecipeParser, max: number, list: Ref<Recipe[]> }) {
    let recipes = JSON.parse(jsonString) as unknown
    if (!recipes) {
        logError('parseRecipes', 'Could not read recipes')
        return
    }

    let parse: (recipe: unknown) => Recipe
    // Not implemented yet
    throw new Error('Not implemented yet')

    // Convert recipes to array
    if (!Array.isArray(recipes)) {
        recipes = [recipes]
    }

    for (const recipe of (recipes as unknown[]).slice(0, options.max)) {
        const parsedRecipe = parse(recipe)
        if (parsedRecipe) {
            options.list.value.push(parsedRecipe)
        }
    }
}