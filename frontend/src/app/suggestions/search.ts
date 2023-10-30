import {ItemQuery, RecipeSuggestion, SearchQuery} from "@/app/suggestions/index.ts";
import {useRecipeStore} from "@/app/storage";
import {Recipe} from "@/shared/types";

/**
 * Search recipes based on the given query
 * @param query
 */
export function searchRecipes(query: SearchQuery): RecipeSuggestion[] {
    const store = useRecipeStore()
    const recipes: Recipe[] = store.getRecipesAsList

    const suggestedRecipes = recipes.filter((recipe: Recipe) => {
        return filterRecipeByItems(recipe, query.items) &&
            filterRecipeByDuration(recipe, query.duration) &&
            filterRecipeByTag(recipe, query.tags) &&
            filterByPrice(recipe, query.price)
    })

    return suggestedRecipes.map((recipe: Recipe) => {
        const suggestion = new RecipeSuggestion()
        suggestion.recipe = recipe
        suggestion.id = recipe.getId()
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
