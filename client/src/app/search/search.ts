/*
 * Copyright (c) 2023-2024 Josef Müller.
 */

import { RecipeSuggestion } from '@/app/search';
import { useRecipeStore } from '@/app/storage';
import { logError } from '@/shared/utils/logging';
import { mutateString } from '@/app/search/util';
import { PrefixIdTree } from '@/app/search/radix';
import { ERROR_MSG } from '@/shared/utils/errors.ts';
import { Ingredient, Recipe, RecipeIngredient } from '@/shared';

export class TasteBuddySearch {
    // Map of search terms to recipe ids
    private readonly _recipes: PrefixIdTree
    private readonly _ingredients: PrefixIdTree

    constructor(recipes?: Recipe[], ingredients?: Ingredient[]) {
        this._recipes = new PrefixIdTree()
        this._ingredients = new PrefixIdTree()

        // Add all recipes
        if (recipes !== undefined) {
            for (const recipe of recipes) {
                this.addRecipe(recipe)
            }
        }

        // Add all ingredients
        if (ingredients !== undefined) {
            for (const ingredient of ingredients) {
                this.addIngredient(ingredient)
            }
        }
    }

    /**
     * Add a recipe to the search index
     * @param recipe
     */
    addRecipe(recipe: Recipe) {
        const fields = [
            // Name
            ...recipe.name.getAll(),
            // Description
            ...recipe.description.getAll(),
            // Ingredients
            ...recipe.ingredients.flatMap((ingredient: RecipeIngredient) => ingredient.ingredient.name.getAll()),
        ]

        // Add all possible mutations
        for (const field of fields) {
            for (const mutation of mutateString(field)) {
                this._recipes.insert(mutation, recipe.id)
            }
        }
    }

    /**
     * Add an ingredient to the search index
     * @param ingredient
     */
    addIngredient(ingredient: Ingredient) {
        const fields = [
            ...ingredient.name.getAll(),
        ]

        // Add all possible mutations
        for (const field of fields) {
            for (const mutation of mutateString(field)) {
                this._ingredients.insert(mutation, ingredient.id)
            }
        }
    }

    /**
     * Search for a recipe based on the given query
     * @param query is a plain string
     * @return {string[]} list of recipe ids
     */
    search(query: string): string[] {
        return this._recipes.search(query)
    }
}

export function searchRecipesByQuery(query: string): RecipeSuggestion[] {
    const store = useRecipeStore()
    const recipesAsMap = store.recipeMap
    const recipeSearch = store.search
    if (recipeSearch === null) {
        logError('searchRecipesByString', ERROR_MSG.isNull)
        return []
    }

    return recipeSearch.search(query)
        .map((recipeId: string) => recipesAsMap[recipeId])
        .map((recipe: Recipe) => {
            const suggestion = new RecipeSuggestion(recipe)
            suggestion.recipe_price = recipe.getPrice()
            suggestion.missing_ingredients = []
            return suggestion
        })
}
