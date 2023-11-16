/*
 * Copyright (c) 2023 Josef Müller.
 */

import {Recipe} from '@/shared';
import {logError} from '@/shared/utils/logging';
import {Ref} from 'vue';
import {CookstrParser} from '@/editor/parser/cookstr';
import {AllRecipesParser} from '@/editor/parser/allrecipes';

export enum RecipeParser {
    Cookstr = 'cookstr',
    AllRecipes = 'allrecipes',
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
    switch (options.parser) {
        case RecipeParser.Cookstr:
            parse = CookstrParser.parse as (recipe: unknown) => Recipe
            break
        case RecipeParser.AllRecipes:
            parse = AllRecipesParser.parse as (recipe: unknown) => Recipe
            break
    }

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