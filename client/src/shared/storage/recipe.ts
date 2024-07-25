/*
 * Copyright (c) 2023-2024 Josef Müller.
 */

// Vue
import {defineStore} from 'pinia'

import {API_ROUTE, APIResponse, Item, Recipe, sendToAPI} from '@/shared';
import {logDebug} from '@/shared/utils/logging';
import {useSharedStore} from '@/shared/storage/shared.ts';
import {CachedItem, getCachedItem, removeCachedItem, setCachedItem} from '@/shared/storage/cache.ts';


// Define typings for the store state

interface SharedRecipeStoreState {
    recipes: { [id: string]: Recipe },
    items: { [id: string]: Item }
}

// Create the store
// called by main.ts
export const useSharedRecipeStore = defineStore('recipes-shared', {
    state: (): SharedRecipeStoreState => ({
        recipes: {}, items: {}
    }), getters: {
        /**
         * Get the recipes as list
         * @param state
         */
        getRecipesAsList: (state): Recipe[] => {
            const recipesAsList: Recipe[] = Object.values(state.recipes ?? {})
            if (recipesAsList.length === 0) {
                return []
            }
            return recipesAsList
        }, /**
         * Get the recipes mapped by their id
         * @param state
         */
        getRecipesAsMap: (state): { [id: string]: Recipe } => state.recipes ?? {}, getItemsAsList: (state): Item[] => {
            return Object.values(state.items ?? {}) ?? []
        }, getItemNamesAsList(): string[] {
            return (this.getItemsAsList ?? []).flatMap((item: Item) => item.getAllNames())
        }, getItemIdsToName(): { [id: string]: string } {
            return (this.getItemsAsList ?? []).reduce((map: { [id: string]: string }, item: Item) => {
                map[item.getId()] = item.getName()
                return map
            }, {})
        }, getItemsSortedByName(): Item[] {
            return (this.getItemsAsList ?? [])
                .toSorted((a: Item, b: Item) => a.getName().localeCompare(b.getName()))
        }, getItemsAsMap: (state): { [id: string]: Item } => {
            return state.items ?? {}
        }, getTags(): string[] {
            return [...new Set(this.getRecipesAsList.reduce((tags: string[], recipe: Recipe) => {
                return [...tags, ...(recipe.props.tags ?? [])]
            }, []))]
        }
    }, actions: {
        async fetchItems(): Promise<Item[] | null> {
            const sharedStore = useSharedStore()
            logDebug('fetchItems', 'fetching items')
            sharedStore.startLoading('fetchItems')
            return sendToAPI<Item[]>(API_ROUTE.GET_ITEMS, {errorMessage: 'Could not fetch items'})
                .then((apiResponse: APIResponse<Item[]>) => {
                    // map the items JSON to Item objects
                    // this is because the JSON is not a valid Item object,
                    // and we need to use the Item class methods
                    if (!apiResponse.error) {
                        const items: Item[] = apiResponse.response.map((item: Item) => Item.fromJSON(item))
                        this.setItems(items)
                    }
                    sharedStore.finishLoading('fetchItems')
                    return !apiResponse.error ? apiResponse.response : null
                })
        }, /**
         * Fetch the recipes from the API and store them in the store
         */
        async fetchRecipes(): Promise<Recipe[] | null> {
            const sharedStore = useSharedStore()
            logDebug('fetchRecipes', 'fetching recipes')
            sharedStore.startLoading('fetchRecipes')
            return sendToAPI<Recipe[]>(API_ROUTE.GET_RECIPES, {errorMessage: 'Could not fetch recipes'})
                .then(async (apiResponse: APIResponse<Recipe[]>) => {
                    // map the recipes JSON to Recipe objects
                    // this is because the JSON is not a valid Recipe object,
                    // and we need to use the Recipe class methods
                    if (!apiResponse.error) {
                        return await Promise.all(apiResponse.response.map((recipe: Recipe) => Recipe.fromJSON(recipe)))
                            .then((recipes: Recipe[]) => this.setRecipes(recipes.map((recipe: Recipe) => new Recipe(recipe))))
                    }
                    return null
                })
                .then((recipes: Recipe[] | null) => {
                    sharedStore.finishLoading('fetchRecipes')
                    return recipes
                })
        }, /**
         * Prepare the Ionic Storage by fetching the items and recipes
         * If the cache is old, the items and recipes are fetched from the API
         */
        async prepareStore() {
            const sharedStore = useSharedStore()

            /* Items */
            return getCachedItem<Item[]>('items', [], this.fetchItems)
                .then((items: CachedItem<Item[]>) => {
                    return this.setItems((items.value ?? []).map((item: Item) => Item.fromJSON(item)))
                })
                /* Recipes */
                .then(() => {
                    return getCachedItem<Recipe[]>('recipes', [], this.fetchRecipes)
                })
                .then((recipes: CachedItem<Recipe[]>) => {
                    return Promise.all((recipes.value ?? [])
                        .map((recipe: Recipe) => Recipe.fromJSON(recipe)))
                        .then((recipes: Recipe[]) => this.setRecipes(recipes, false))
                })
                /* Finish preparation */
                .then(() => {
                    sharedStore.finishLoading('initial')
                })
        }, /**
         * Reset the store by removing all items and recipes
         */
        resetStore() {
            this.recipes = {}
            this.items = {}
            return Promise.all([removeCachedItem('recipes'), removeCachedItem('items')])
                .then(() => this.prepareStore())
        }, /**
         * Override all items
         * @param items
         * @param updateCache
         */
        setItems(items: Item[], updateCache = true) {
            logDebug('replaceItems', `replacing ${items.length} items`)
            this.items = Object.assign({}, ...items.map((item: Item) => ({[item.getId()]: item})))
            if (updateCache) {
                return setCachedItem('items', items)
            }
            return Promise.resolve(items)
        }, /**
         * Override all recipes
         * @param recipes
         * @param updateCache
         */
        setRecipes(recipes: Recipe[], updateCache = true) {
            this.recipes = Object.assign({}, ...recipes.map((recipe: Recipe) => ({[recipe.getId()]: recipe})))
            if (updateCache) {
                return setCachedItem('recipes', recipes)
            }
            return Promise.resolve(recipes)
        },
    },
})
