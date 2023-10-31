import {Recipe} from "@/shared/types"
import {useRecipeStore} from "@/app/storage";
import {median} from "@/app/suggestions/util.ts";


/**
 * Very simple function to predict recipes
 * depending on the following params:
 * - duration
 * TODO: - number of steps
 * TODO: - number of ingredients
 * of liked recipes
 */
export function simpleRecipePrediction(): Recipe[] {
    const store = useRecipeStore()
    const savedKeyValues = store.getSavedKeyValues
    const recipes = store.getRecipesAsList

    // use median since it is not influenced by very large or very small values
    const duration: number = median(savedKeyValues.duration)

    return recipes.toSorted((a: Recipe, b: Recipe) => {
        return Math.abs(a.getDuration() - duration) - Math.abs(b.getDuration() - duration)
    })
}