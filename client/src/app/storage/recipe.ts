/*
 * Copyright (c) 2023-2024 Josef Müller.
 */

import { Item, Recipe, RecipeItem } from '@/shared';
import { TasteBuddySearch } from '@/app/search/search.ts';
import { defineStore } from 'pinia';
import { useSharedRecipeStore } from '@/shared/storage/recipe.ts';
import { CachedItem, getCachedItem, setCachedItem } from '@/shared/storage/cache.ts';
import { simpleRecipeSuggestion } from '@/app/search/suggestion.ts';
import { logDebug } from '@/shared/utils/logging.ts';

interface RecipeState {
    recipePredictions: Recipe[]
    savedRecipes: Set<string>
    search: TasteBuddySearch | null
    config: {
        numberOfPredictions: number
    }
}

const MODULE = 'app.storage.recipe.'

// Create the store
// called by main.ts
export const useRecipeStore = defineStore('recipes-app', {
    state: (): RecipeState => ({
        recipePredictions: [], savedRecipes: new Set(), search: null, config: {
            numberOfPredictions: 10
        }
    }), getters: {
        getItemSuggestions(): Item[] {
            // Get all items from the recipes
            const randomItems: Item[] = (this.getItemsAsList ?? []).filter(() => Math.random() < 0.5)

            const itemsFromSavedRecipes: Item[] = (this.getSavedRecipes ??
                []).reduce((items: Item[], recipe: Recipe) => {
                const recipeItems: Item[] = recipe.getRecipeItems().map((item: RecipeItem) => this.getItemsAsMap[item.id])
                return [...items, ...recipeItems]
            }, [])

            const itemIds = new Set([...randomItems, ...itemsFromSavedRecipes].map((item: Item) => item.getId()))
            return [...itemIds].map((itemId: string) => this.getItemsAsMap[itemId]).filter((item: Item) => typeof item !==
                'undefined')
        }, getItemsAsList: (): Item[] => {
            const sharedRecipeStore = useSharedRecipeStore()
            return sharedRecipeStore.getItemsAsList
        }, getItemsAsMap: (): {
            [id: string]: Item
        } => {
            const sharedRecipeStore = useSharedRecipeStore()
            return sharedRecipeStore.getItemsAsMap
        }, /**
         * Get the recipe of the day
         */
        getRecipeOfTheDay(): Recipe {
            // Calculate the day of the year
            const now: Date = new Date();
            const start: Date = new Date(now.getFullYear(), 0, 0);
            const diff: number = (now.getTime() - start.getTime()) +
                ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
            const oneDay: number = 1000 * 60 * 60 * 24;
            const day: number = Math.floor(diff / oneDay);

            // Sort array pseudo-randomly
            let state = 5021 % 2147483647;
            if (state <= 0) {
                state += 2147483646;
            }

            const getRandom = () => {
                state = (state * 16807) % 2147483647;
                return (state - 1) / 2147483646;
            };
            const randSortedRecipesAsList = this.getRecipesAsList.toSorted(() => getRandom() - 0.5);

            // Get the recipe of the day depending on the day of the year
            return randSortedRecipesAsList[day % randSortedRecipesAsList.length]
        }, getRecipePredictions(): Recipe[] {
            return this.recipePredictions ?? []
        }, /**
         * Get the recipes as list
         */
        getRecipesAsList(): Recipe[] {
            const sharedRecipeStore = useSharedRecipeStore()
            return sharedRecipeStore.getRecipesAsList
        }, /**
         * Get the recipes mapped by their id
         */
        getRecipesAsMap: (): {
            [id: string]: Recipe
        } => {
            const sharedRecipeStore = useSharedRecipeStore()
            return sharedRecipeStore.getRecipesAsMap
        }, getSavedRecipesStats(): {
            numberOfSteps: number[], numberOfIngredients: number[], duration: number[], itemsIds: Map<string, number>
        } {
            const keyValues: {
                numberOfSteps: number[],
                numberOfIngredients: number[],
                duration: number[],
                itemsIds: Map<string, number>
            } = {
                numberOfSteps: [], numberOfIngredients: [], duration: [], itemsIds: new Map()
            }
            const savedRecipes = this.getSavedRecipes
            for (const savedRecipe of savedRecipes) {
                keyValues.numberOfSteps.push(savedRecipe.steps.length)
                keyValues.numberOfIngredients.push(savedRecipe.getRecipeItems().length)
                keyValues.duration.push(savedRecipe.getDuration())
                for (const item of savedRecipe.getRecipeItems()) {
                    const count = keyValues.itemsIds.get(item.id) ?? 0
                    keyValues.itemsIds.set(item.id, count + 1)
                }
            }

            return {
                numberOfSteps: keyValues.numberOfSteps,
                numberOfIngredients: keyValues.numberOfIngredients,
                duration: keyValues.duration,
                itemsIds: keyValues.itemsIds
            }
        }, /**
         * Get the ids of saved recipes as a list
         */
        getSavedRecipesIds(state): string[] {
            return [...state.savedRecipes ?? []]
        }, /**
         * Get the saved recipes as a list
         * @param state
         * @returns a list of saved recipes
         */
        getSavedRecipes(state): Recipe[] {
            return [...state.savedRecipes.keys()].reduce((recipes: Recipe[], recipeId: string) => {
                if (recipeId in this.getRecipesAsMap) {
                    recipes.push(this.getRecipesAsMap[recipeId])
                }
                return recipes
            }, [])
        }, /**
         * Get saved recipes as a map
         * @param state
         */
        getSavedRecipesAsMap(state): {
            [id: string]: Recipe
        } {
            return [...state.savedRecipes.keys()].reduce((recipes: {
                [id: string]: Recipe
            }, recipeId) => {
                recipes[recipeId] = this.getRecipesAsMap[recipeId]
                return recipes
            }, {})
        }, getTags(): string[] {
            return [...new Set(this.getRecipesAsList.reduce((tags: string[], recipe: Recipe) => {
                return [...tags, ...(recipe.props.tags ?? [])]
            }, []))]
        }
    }, actions: {
        async prepareSearch() {
            this.search = new TasteBuddySearch(this.getRecipesAsList)
        }, /**
         * Prepare the Ionic Storage by fetching the items and recipes
         * This action calls the prepareStore action of the {@link useSharedRecipeStore}
         * If the cache is old, the items and recipes are fetched from the API
         */
        async prepareStore() {
            return useSharedRecipeStore().prepareStore()
                /* Saved Recipes */
                .then(() => {
                    return getCachedItem<string[]>('savedRecipes', [])
                })
                .then((savedRecipes: CachedItem<string[]>) => {
                    return this.setSavedRecipes(savedRecipes.value ?? [])
                })
                .then(() => {
                    return this.prepareSearch()
                })
        }, /**
         * Remove or add a recipe to the saved recipes
         * @param recipe
         */
        setSaved(recipe: Recipe) {
            if (!this.savedRecipes.has(recipe.getId())) {
                this.savedRecipes.add(recipe.getId())
            } else {
                this.savedRecipes.delete(recipe.getId())
            }

            this.updateRecipePredictions()
            return setCachedItem('savedRecipes', [...this.savedRecipes])
        }, /**
         * Override all saved recipes
         * @param savedRecipes
         */
        setSavedRecipes(savedRecipes: string[]) {
            this.savedRecipes = new Set(savedRecipes)
            this.updateRecipePredictions()
            return setCachedItem('savedRecipes', [...this.savedRecipes])
        }, /**
         * Update the recipe predictions
         */
        updateRecipePredictions() {
            const predictedRecipes = simpleRecipeSuggestion(this.config.numberOfPredictions)
            logDebug(MODULE + this.updateRecipePredictions.name, predictedRecipes)
            // Get the 10 best predictions
            this.recipePredictions = predictedRecipes
        }
    },
})
