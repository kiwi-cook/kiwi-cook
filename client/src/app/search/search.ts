/*
 * Copyright (c) 2023-2024 Josef Müller.
 */

import { ItemQuery, RecipeSuggestion, SearchQuery } from '@/app/search';
import { useRecipeStore } from '@/app/storage';
import { Item, Recipe } from '@/shared';
import { logError } from '@/shared/utils/logging';
import { mutateString } from '@/app/search/util';
import { PrefixIdTree } from '@/app/search/radix';

export class TasteBuddySearch {
    // Map of search terms to recipe ids
    private readonly _recipes: PrefixIdTree
    private readonly _items: PrefixIdTree

    constructor(recipes?: Recipe[], items?: Item[]) {
        this._recipes = new PrefixIdTree()
        this._items = new PrefixIdTree()

        // Add all recipes
        if (recipes !== undefined) {
            for (const recipe of recipes) {
                this.addRecipe(recipe)
            }
        }

        // Add all items
        if (items !== undefined) {
            for (const item of items) {
                this.addItem(item)
            }
        }
    }

    /**
     * Add a recipe to the search index
     * @param recipe
     */
    addRecipe(recipe: Recipe) {
        const fields = [// Name
            ...Object.values(recipe.name),]

        // Add all possible mutations
        for (const field of fields) {
            for (const mutation of mutateString(field)) {
                this._recipes.insert(mutation, recipe.id)
            }
        }
    }

    /**
     * Add an item to the search index
     * @param item
     */
    addItem(item: Item) {
        const fields = [// Name
            ...Object.values(item.name),]

        // Add all possible mutations
        for (const field of fields) {
            for (const mutation of mutateString(field)) {
                this._items.insert(mutation, item.id)
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

export function searchRecipesByQuery(query: string): Recipe[] {
    const store = useRecipeStore()
    const recipesAsMap = store.getRecipesAsMap
    const recipeSearch = store.search
    if (recipeSearch === null) {
        logError('searchRecipesByString', 'search is not initialized')
        return []
    }
    return recipeSearch.search(query).map((recipeId: string) => recipesAsMap[recipeId])
}


/**
 * Search recipes based on the given query
 * @param query
 */
export function searchRecipes(query: SearchQuery): RecipeSuggestion[] {
    const store = useRecipeStore()
    const recipes: Recipe[] = store.getRecipesAsList

    const suggestedRecipes = recipes.filter((recipe: Recipe) => {
        return filterRecipeByItems(recipe, query.items) && filterRecipeByDuration(recipe, query.duration) &&
            filterRecipeByTag(recipe, query.tags) && filterByPrice(recipe, query.price)
    })

    return suggestedRecipes.map((recipe: Recipe) => {
        const suggestion = new RecipeSuggestion(recipe)
        suggestion.recipe_price = recipe.getPrice()
        suggestion.missing_items = []
        return suggestion
    })
}

/**
 * Checks if a recipe contains all items in the itemQuery
 * @param itemQuery
 * @param recipe
 * @return {boolean} true if the itemQuery is satisfied by the recipe
 */
function filterRecipeByItems(recipe: Recipe, itemQuery: ItemQuery[]): boolean {
    return itemQuery.every((itemQ: ItemQuery) => {
        // Check if item exists in recipe
        const itemExists = recipe.hasItem(itemQ.id)
        // Either item exists and we want to include it,
        // or item doesn't exist, and we want to exclude it
        return itemExists !== itemQ.exclude
    })
}

/**
 * Checks if a recipe is within the maxDuration
 * @param recipe
 * @param maxDuration
 */
function filterRecipeByDuration(recipe: Recipe, maxDuration?: number): boolean {
    if (maxDuration === undefined) {
        return true
    }
    return recipe.getDuration() <= maxDuration
}

/**
 * Checks if a recipe contains all tags in the tagQuery
 * @param recipe
 * @param tags
 */
function filterRecipeByTag(recipe: Recipe, tags: string[]): boolean {
    const recipeTags = recipe.getTags()
    return tags.every((tag: string) => recipeTags.includes(tag))
}

/**
 * Checks if a recipe is within the price range
 */
function filterByPrice(recipe: Recipe, maxPrice?: number): boolean {
    if (maxPrice === undefined) {
        return true
    }
    const recipePrice = recipe.getPrice()
    return recipePrice <= maxPrice
}
