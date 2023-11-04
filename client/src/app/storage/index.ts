// Vue
import {defineStore} from 'pinia'

// Compression
import {compress, decompress} from 'lz-string'

// Types
// Ionic
import {Drivers, Storage} from '@ionic/storage';
import {
    API_ROUTE,
    APIResponse,
    Item,
    itemFromJSON,
    logDebug,
    logError,
    Recipe,
    recipeFromJSON,
    sendToAPI,
} from '@/shared/ts';
import {DEFAULT_LOCALE, i18n, setI18nLanguage, SUPPORT_LOCALES, SUPPORT_LOCALES_TYPE} from '@/shared/locales/i18n.ts';
import {simpleRecipePrediction} from '@/app/suggestions/simple.ts';

const ionicStorage = new Storage({
    name: 'tastebuddy_db',
    driverOrder: [Drivers.LocalStorage]
});
await ionicStorage.create();

// 3 days
const MAX_CACHE_AGE = 1000 * 60 * 60 * 24 * 3

interface CachedItem<T> {
    value: T | null,
    isOld: boolean
}

/**
 * Cache item in the Ionic Storage and set a timestamp
 * @param key
 * @param value
 */
async function setCachedItem<T>(key: string, value: T) {
    const tsStart = performance.now()
    logDebug('setCachedItem', key, value)
    if (value === null || typeof value === 'undefined') {
        return value
    }

    const compressedValue = compress(JSON.stringify(value))
    return ionicStorage.set(key, {date: new Date().getTime(), value: compressedValue}).then(() => {
        logDebug('setCachedItem', `saved ${key} to cache`)
        const tsEnd = performance.now()
        logDebug('setCachedItem', `Saved ${key} to cache in ${tsEnd - tsStart}ms`)
        return value
    }).catch((error) => {
        logError('setCachedItem', `error saving ${key} to cache:`, error)
        logDebug('setCachedItem', value)
        return value
    })
}

/**
 * Get the cached item
 * @param key
 * @param defaultValue
 * @param fetch function that is called to fetch the items, if the one in the cache is old
 */
async function getCachedItem<T>(key: string, defaultValue: T, fetch: (() => Promise<T | null>) | null = null): Promise<CachedItem<T>> {
    logDebug('getCachedItem', `getting ${key} from cache`)
    const tsStart = performance.now()
    return ionicStorage.get(key)
        .then((cachedItem: {
            date: number,
            value: any
        }) => {
            if (!cachedItem || typeof cachedItem === 'undefined') {
                return {value: null, isOld: true}
            }
            const uncompressedString: string = decompress(cachedItem.value)
            const uncompressedValue: T = JSON.parse(uncompressedString) as T
            const tsEnd = performance.now()
            logDebug('getCachedItem', `loaded ${key} from cache in ${tsEnd - tsStart}ms`)
            const isOld = (new Date().getTime() - cachedItem?.date) > MAX_CACHE_AGE

            return {value: uncompressedValue, isOld: isOld}
        })
        .then(async (cachedItem: CachedItem<T>) => {
            // if it cannot call the fetch method, immediately return the cached value
            if (fetch === null || (!cachedItem.isOld && cachedItem.value !== null)) {
                return cachedItem
            }

            logDebug('getCachedItem', 'fetching value because cache is invalid')
            return fetch().then((fetchedItem: T | null) => {
                logDebug('getCachedItem', `fetched ?= null: ${fetchedItem === null}, cached ?= null: ${cachedItem.value === null}, default: ${defaultValue}`)
                return {
                    value: fetchedItem ?? cachedItem.value ?? defaultValue,
                    isOld: false
                }
            })
        })
}

// Define typings for the store state

interface TasteBuddyAppState {
    language: {
        lang: string,
        supportedLanguages: string[]
    },
    timer: {
        recipeId?: string,
        time: number,
        remaining: number,
        timerInterval: number | null
    } | null
}

export const useTasteBuddyStore = defineStore('tastebuddy-app', {
    state: (): TasteBuddyAppState => ({
        language: {
            lang: DEFAULT_LOCALE,
            supportedLanguages: SUPPORT_LOCALES
        },
        timer: null
    }),
    actions: {
        /**
         * Change the language
         * @param language
         */
        setLanguage(language: SUPPORT_LOCALES_TYPE) {
            this.language.lang = language
            setI18nLanguage(i18n, language)
        },
        /**
         * Set step timer for a recipe
         * @param time in minutes
         * @param recipeId
         */
        async setTimer(time?: number, recipeId?: string) {
            // If no time is given, return immediately
            if (!time) {
                return Promise.resolve()
            }

            // Stop the timer if it is already running
            if (this.timer !== null) {
                await this.stopTimer()
            }

            this.timer = {
                recipeId: recipeId,
                time: time * 60,
                remaining: time * 60,
                timerInterval: null
            }

            // Start the timer
            this.timer.timerInterval = setInterval(() => {
                if (this.timer !== null) {
                    this.timer.remaining -= 1
                } else {
                    const audio = new Audio('/assets/audio/timer.mp3');
                    audio.play();
                    this.stopTimer()
                }
            }, 1000)
        },
        async resetTimer() {
            if (this.timer === null) {
                return
            }
            this.timer.remaining = this.timer.time
        },
        async stopTimer() {
            if (this.timer === null) {
                return
            }
            if (this.timer.timerInterval !== null) {
                clearInterval(this.timer.timerInterval)
            }
            this.timer = null
        },
    }
})

interface RecipeState {
    loading: {
        [key: string]: boolean
    }
    recipes: {
        [id: string]: Recipe
    }
    recipePredictions: Recipe[]
    savedRecipes: Set<string>
    items: {
        [id: string]: Item
    },

}

// Create the store
// called by main.ts
export const useRecipeStore = defineStore('recipes-app', {
    state: (): RecipeState => ({
        loading: {
            initial: true,
        },
        recipes: {},
        recipePredictions: [],
        savedRecipes: new Set(),
        items: {}
    }),
    getters: {
        getItemNamesAsList(): string[] {
            return this.getItemsAsList.map((item: Item) => item.getName())
        },
        getItemSuggestions(): Item[] {
            // Get all items from the recipes
            const randomItems: Item[] = (this.getItemsAsList ?? []).filter(() => Math.random() < 0.5)

            const itemsFromSavedRecipes: Item[] = (this.getSavedRecipes ?? []).reduce((items: Item[], recipe: Recipe) => {
                return [...items, ...recipe.getStepItems()]
            }, [])

            const itemIds = new Set([...randomItems, ...itemsFromSavedRecipes].map((item: Item) => item.getId()))
            return [...itemIds].map((itemId: string) => this.items[itemId]).filter((item: Item) => typeof item !== 'undefined')
        },
        getItemsAsList: (state): Item[] => Object.values(state.items ?? {}) ?? [],
        getItemsAsMap: (state): {
            [id: string]: Item
        } => state.items ?? {},
        getRecipeOfTheDay(): Recipe {
            // Calculate the day of the year
            const now: Date = new Date();
            const start: Date = new Date(now.getFullYear(), 0, 0);
            const diff: number = (now.getTime() - start.getTime()) +
                ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
            const oneDay: number = 1000 * 60 * 60 * 24;
            const day: number = Math.floor(diff / oneDay);

            // Get the recipe of the day depending on the day of the year
            return this.getRecipesAsList[day % this.getRecipesAsList.length]
        },
        getRecipePredictions(): Recipe[] {
            return this.recipePredictions ?? []
        },
        /**
         * Get the recipes as list
         */
        getRecipesAsList(): Recipe[] {
            return (Object.values(this.getRecipesAsMap) ?? [])
                .toSorted((a: Recipe, b: Recipe) => a.getName().localeCompare(b.getName()))
        },
        /**
         * Get the recipes mapped by their id
         * @param state
         */
        getRecipesAsMap: (state): {
            [id: string]: Recipe
        } => state.recipes ?? {},
        getSavedKeyValues(): {
            numberOfSteps: number[],
            numberOfIngredients: number[],
            duration: number[]
        } {
            const keyValues: {
                numberOfSteps: number[],
                numberOfIngredients: number[],
                duration: number[]
            } = {
                numberOfSteps: [],
                numberOfIngredients: [],
                duration: []
            }
            const savedRecipes = this.getSavedRecipes
            for (const savedRecipe of savedRecipes) {
                keyValues.numberOfSteps.push(savedRecipe.steps.length)
                keyValues.numberOfIngredients.push(savedRecipe.getStepItems().length)
                keyValues.duration.push(savedRecipe.getDuration())
            }

            return {
                numberOfSteps: keyValues.numberOfSteps,
                numberOfIngredients: keyValues.numberOfIngredients,
                duration: keyValues.duration
            }
        },
        /**
         * Get the ids of saved recipes as a list
         */
        getSavedRecipesIds(state): string[] {
            return [...state.savedRecipes ?? []]
        },
        /**
         * Get the saved recipes as a list
         * @param state
         * @returns a list of saved recipes
         */
        getSavedRecipes(state): Recipe[] {
            return [...state.savedRecipes.keys()].reduce((recipes: Recipe[], recipeId: string) => {
                if (recipeId in this.recipes) {
                    recipes.push(this.recipes[recipeId])
                }
                return recipes
            }, [])
        },
        /**
         * Get saved recipes as a map
         * @param state
         */
        getSavedRecipesAsMap(state): {
            [id: string]: Recipe
        } {
            return [...state.savedRecipes.keys()].reduce((recipes: {
                [id: string]: Recipe
            }, recipeId) => {
                recipes[recipeId] = this.recipes[recipeId]
                return recipes
            }, {})
        },
        getTags(): string[] {
            return [...new Set(this.getRecipesAsList.reduce((tags: string[], recipe: Recipe) => {
                return [...tags, ...(recipe.props.tags ?? [])]
            }, []))]
        },
        isLoading: (state): boolean => Object.values(state.loading).some((isLoading: boolean) => isLoading),
        isLoadingInitial: (state): boolean => state.loading.initial
    },
    actions: {
        async fetchItems(): Promise<Item[] | null> {
            logDebug('fetchItems', 'fetching items')
            this.setLoadingState('fetchItems')
            return sendToAPI<Item[]>(API_ROUTE.GET_ITEMS, {errorMessage: 'Could not fetch items'})
                .then((apiResponse: APIResponse<Item[]>) => {
                    // map the items JSON to Item objects
                    // this is because the JSON is not a valid Item object,
                    // and we need to use the Item class methods
                    if (!apiResponse.error) {
                        const items: Item[] = apiResponse.response.map((item: Item) => itemFromJSON(item))
                        this.setItems(items)
                        return apiResponse.response
                    }
                    return null
                })
                .then((response: Item[] | null) => {
                    this.finishLoading('fetchItems')
                    return response
                })
        },
        /**
         * Fetch the recipes from the API and store them in the store
         */
        async fetchRecipes(): Promise<Recipe[] | null> {
            logDebug('fetchRecipes', 'fetching recipes')
            this.setLoadingState('fetchRecipes')
            return sendToAPI<Recipe[]>(API_ROUTE.GET_RECIPES, {errorMessage: 'Could not fetch recipes'})
                .then(async (apiResponse: APIResponse<Recipe[]>) => {
                    logDebug('fetchRecipes', apiResponse)
                    // map the recipes JSON to Recipe objects
                    // this is because the JSON is not a valid Recipe object,
                    // and we need to use the Recipe class methods
                    if (!apiResponse.error) {
                        return await Promise.all(apiResponse.response.map((recipe: Recipe) => recipeFromJSON(recipe)))
                            .then((recipes: Recipe[]) => this.setRecipes(recipes))
                            .then(() => apiResponse.response)
                    }

                    return null
                }).then((response: Recipe[] | null) => {
                    this.finishLoading('fetchRecipes')
                    return response
                })
        },
        /**
         * Finish the loading state
         * @param key
         */
        finishLoading(key: string) {
            this.loading[key] = false
        },
        /**
         * Prepare the Ionic Storage by fetching the items and recipes
         * If the cache is old, the items and recipes are fetched from the API
         */
        async prepare() {
            /* Items */
            getCachedItem<Item[]>('items', [], this.fetchItems)
                .then((items: CachedItem<Item[]>) => {
                    return this.setItems((items.value ?? []).map((item: Item) => itemFromJSON(item)))
                })
                /* Recipes */
                .then(() => {
                    return getCachedItem<Recipe[]>('recipes', [], this.fetchRecipes)
                })
                .then((recipes: CachedItem<Recipe[]>) => {
                    Promise.all((recipes.value ?? [])
                        .map((recipe: Recipe) => recipeFromJSON(recipe)))
                        .then((recipes: Recipe[]) => this.setRecipes(recipes, false))
                })
                /* Saved Recipes */
                .then(() => {
                    return getCachedItem<string[]>('savedRecipes', [])
                })
                .then((savedRecipes: CachedItem<string[]>) => {
                    return this.setSavedRecipes(savedRecipes.value ?? [])
                })
                /* Finish preparation */
                .then(() => {
                    this.finishLoading('initial')
                })
        },
        /**
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
        },
        /**
         * Set the loading state
         * @param key
         */
        setLoadingState(key: string) {
            this.loading[key] = true
        },
        /**
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
        /**
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
        },
        /**
         * Override all saved recipes
         * @param savedRecipes
         */
        setSavedRecipes(savedRecipes: string[]) {
            this.savedRecipes = new Set(savedRecipes)
            this.updateRecipePredictions()
            return setCachedItem('savedRecipes', [...this.savedRecipes])
        },
        /**
         * Update the recipe predictions
         */
        updateRecipePredictions() {
            const predictedRecipes = simpleRecipePrediction().slice(0, 10)
            logDebug('updateRecipePredictions', predictedRecipes)
            // Get the 10 best predictions
            this.recipePredictions = predictedRecipes
        }
    },
})
