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
} from "@/shared/ts";
import {DEFAULT_LOCALE, i18n, setI18nLanguage, SUPPORT_LOCALES, SUPPORT_LOCALES_TYPE} from "@/shared/locales/i18n.ts";
import {predictRecipes} from "@/app/suggestions/ml.ts";

const ionicStorage = new Storage({
    name: '__mydb',
    driverOrder: [Drivers.LocalStorage]
});
await ionicStorage.create();

// 24 hours
const MAX_CACHE_AGE = 1000 * 60 * 60 * 24

/**
 * Cache item in the Ionic Storage and set a timestamp
 * @param key
 * @param value
 */
async function setCachedItem<T>(key: string, value: T) {
    logDebug('setCachedItem', key, value)
    if (value === null || typeof value === 'undefined') {
        return value
    }

    const compressedValue = compress(JSON.stringify(value))
    return ionicStorage.set(key, {date: new Date().getTime(), value: compressedValue}).then(() => {
        logDebug('setCachedItem', `saved ${key} to cache`)
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
 */
async function getCachedItem<T>(key: string): Promise<{ value: T | null, isOld: boolean }> {
    logDebug('getCachedItem', `getting ${key} from cache`)
    const tsStart = performance.now()
    return ionicStorage.get(key).then((cachedItem: {
        date: number,
        value: any
    }) => {
        if (!cachedItem || typeof cachedItem === 'undefined') {
            return {value: null, isOld: true}
        }
        const uncompressedString: string = decompress(cachedItem.value)
        const uncompressedValue: T = JSON.parse(uncompressedString) as T
        const tsEnd = performance.now()
        logDebug('getCachedItem', `Loaded ${key} from cache in ${tsEnd - tsStart}ms`)

        return {value: uncompressedValue, isOld: (new Date().getTime() - cachedItem?.date) > MAX_CACHE_AGE}
    })
}

// Define typings for the store state

interface UserState {
    user: {
        authenticated: boolean
    },
    language: {
        lang: string,
        supportedLanguages: string[]
    },
    greetings: string[][]
}

export const useTasteBuddyStore = defineStore('tastebuddy', {
    state: (): UserState => ({
        user: {
            authenticated: false,
        },
        language: {
            lang: DEFAULT_LOCALE,
            supportedLanguages: SUPPORT_LOCALES
        },
        greetings: [],
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
         * Get the greetings
         */
        async getGreeting(): Promise<string[]> {
            const selectRand = (greetings: string[][]): string[] => greetings[Math.floor(Math.random() * greetings.length)]

            if (this.greetings.length > 0) {
                return Promise.resolve(selectRand(this.greetings))
            } else {
                return getCachedItem<string[][]>('greetings')
                    .then((cachedGreetings) => {
                        if (cachedGreetings.isOld) {
                            logDebug('fetchGreetings', 'fetching greetings')
                            return fetch('https://raw.githubusercontent.com/taste-buddy/greetings/master/greetings.json')
                                .then((response) => response.json())
                                .then((greetings: string[][]) => {
                                    this.greetings = greetings
                                    setCachedItem('greetings', greetings)
                                    return greetings
                                })
                        }
                        return cachedGreetings.value ?? []
                    }).then((greetings: string[][]) => selectRand(greetings))
            }
        }
    }
})

interface RecipeState {
    loading: { [key: string]: boolean }
    recipes: { [id: string]: Recipe }
    recipePredictions: Recipe[]
    savedRecipes: Set<string>
    items: { [id: string]: Item }
    recipesByItemId: { [itemId: string]: string[] }
}

// Create the store
// called by main.ts
export const useRecipeStore = defineStore('recipes', {
    state: (): RecipeState => ({
        loading: {
            app: true,
        },
        recipes: {},
        recipePredictions: [],
        savedRecipes: new Set(),
        items: {},
        recipesByItemId: {},
    }),
    getters: {
        isLoading: (state): boolean => Object.values(state.loading).some((isLoading: boolean) => isLoading),
        /**
         * Get the recipes as list
         * @param state
         */
        getRecipesAsList: (state): Recipe[] => {
            const recipesAsList: Recipe[] = Object.values(state.recipes ?? {})
            if (recipesAsList.length === 0) {
                return []
            }
            recipesAsList.sort((a: Recipe, b: Recipe) => a.getName().localeCompare(b.getName()))
            return recipesAsList
        },
        /**
         * Get the recipes mapped by their id
         * @param state
         */
        getRecipesAsMap: (state): { [id: string]: Recipe } => state.recipes ?? {},
        getRecipesByItemIds(): { [key: string]: string[] } {
            const recipes = this.getRecipesAsList ?? []
            const recipesByItemId: { [key: string]: string[] } = {}

            for (const recipe of recipes) {
                const items = recipe.getStepItems()
                for (const item of items) {
                    if (!(item.getId() in recipesByItemId)) {
                        recipesByItemId[item.getId()] = []
                    }
                    recipesByItemId[item.getId()].push(recipe.getId())
                }
            }
            logDebug('getRecipesByItemIds', recipesByItemId)

            return recipesByItemId
        },
        /**
         * Get the recipes by the item id
         * @param state
         */
        getRecipesAsListByItemId: (state) => (itemId?: string): string[] => state.recipesByItemId[itemId ?? ''] ?? [],
        /**
         * Get saved recipes
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
        getSavedRecipesAsMap(state): { [id: string]: Recipe } {
            return [...state.savedRecipes.keys()].reduce((recipes: { [id: string]: Recipe }, recipeId) => {
                recipes[recipeId] = this.recipes[recipeId]
                return recipes
            }, {})
        },
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
        getItemsAsList: (state): Item[] => {
            return Object.values(state.items ?? {}) ?? []
        },
        getItemNamesAsList(): string[] {
            return (this.getItemsAsList ?? []).map((item: Item) => item.getName())
        },
        getItemsSortedByName(): Item[] {
            const itemsAsArray = this.getItemsAsList ?? []
            if (itemsAsArray.length === 0) {
                return []
            }
            itemsAsArray.sort((a: Item, b: Item) => a.getName().localeCompare(b.getName()))
            return itemsAsArray
        },
        getItemsAsMap: (state): { [id: string]: Item } => state.items ?? {},
        getItemSuggestions(): Item[] {
            // Get all items from the recipes
            const randomItems: Item[] = (this.getItemsAsList ?? []).filter(() => Math.random() < 0.5)

            const itemsFromSavedRecipes: Item[] = (this.getSavedRecipes ?? []).reduce((items: Item[], recipe: Recipe) => {
                return [...items, ...recipe.getStepItems()]
            }, [])

            const itemIds = new Set([...randomItems, ...itemsFromSavedRecipes].map((item: Item) => item.getId()))
            return [...itemIds].map((itemId: string) => this.items[itemId]).filter((item: Item) => typeof item !== 'undefined')
        },
        getTags(): string[] {
            return [...new Set(this.getRecipesAsList.reduce((tags: string[], recipe: Recipe) => {
                return [...tags, ...(recipe.props.tags ?? [])]
            }, []))]
        },
        getRecipePredictions(): Recipe[] {
            return this.recipePredictions ?? []
        }
    },
    actions: {
        /**
         * Prepare the Ionic Storage by fetching the items and recipes
         * If the cache is old, the items and recipes are fetched from the API
         */
        async prepare() {
            const start = performance.now()
            // get all items
            getCachedItem<Item[]>('items')
                .then(async (cachedItem: { value: Item[] | null, isOld: boolean }) => {
                    this.setLoadingState('getCachedItems')
                    if (cachedItem.isOld || cachedItem.value === null) {
                        return this.fetchItems().then((items) => {
                            this.finishLoading('getCachedItems')
                            return items
                        })
                    }

                    return this.replaceItems(cachedItem.value.map((item: Item) => itemFromJSON(item))).then((items) => {
                        this.finishLoading('getCachedItems')
                        return items
                    })
                })
                .then(() => {
                    // get all recipes
                    getCachedItem<Recipe[]>('recipes').then(async (cachedItem: {
                        value: Recipe[] | null,
                        isOld: boolean
                    }) => {
                        this.setLoadingState('getCachedRecipes')
                        if (cachedItem.isOld || cachedItem.value === null) {
                            return this.fetchRecipes().then((recipes) => {
                                this.finishLoading('getCachedRecipes')
                                return recipes
                            })
                        }
                        return Promise.all(cachedItem.value.map((recipe: Recipe) => recipeFromJSON(recipe))).then((recipes: Recipe[]) => {
                            this.finishLoading('getCachedRecipes')
                            return this.replaceRecipes(recipes)
                        })
                    })
                })
                .then(() => {
                    // get saved recipes
                    getCachedItem<string[]>('savedRecipes').then((cachedItem: {
                        value: string[] | null,
                        isOld: boolean
                    }) => {
                        this.setLoadingState('getCachedSavedRecipes')
                        if (!cachedItem.isOld && cachedItem.value !== null) {
                            this.setSavedRecipes(cachedItem.value)
                        }
                        this.finishLoading('getCachedSavedRecipes')
                        this.finishLoading('app')
                        const end = performance.now()
                        logDebug('prepare', `Loaded in ${end - start}ms`)
                    })
                })
        },
        /**
         * Update the recipe predictions
         */
        updateRecipePredictions() {
            predictRecipes((recipes: Recipe[]) => {
                // Get the 10 best predictions
                this.recipePredictions = recipes.slice(0, 10)
            })
        },
        /**
         * Override all recipes
         * @param recipes
         */
        replaceRecipes(recipes: Recipe[]) {
            this.recipes = Object.assign({}, ...recipes.map((recipe: Recipe) => ({[recipe.getId()]: recipe})))
            return setCachedItem('recipes', recipes)
        },
        /**
         * Update multiple recipes
         * @param recipes
         */
        setRecipes(recipes?: Recipe[] | Recipe) {
            if (typeof recipes === 'undefined') {
                this.recipes = {}
                return new Promise<Recipe[]>(() => [])
            }

            if (!Array.isArray(recipes)) {
                this.recipes[recipes.getId()] = recipes
            } else {
                this.recipes = Object.assign(this.recipes, ...recipes.map((recipe: Recipe) => ({[recipe.getId()]: recipe})))
            }
            return setCachedItem('recipes', [...this.getRecipesAsList])
        },
        /**
         * Remove or add a recipe to the saved recipes
         * @param recipe
         */
        setSaved(recipe: Recipe) {
            if (recipe.saved) {
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
            setCachedItem('savedRecipes', [...this.savedRecipes])
        },
        /**
         * Override all items
         * @param items
         */
        replaceItems(items: Item[]) {
            this.items = Object.assign({}, ...items.map((item: Item) => ({[item.getId()]: item})))
            return setCachedItem('items', items)
        },
        /**
         * Override all items
         * @param items
         */
        setItems(items?: Item[] | Item) {
            if (typeof items === 'undefined') {
                this.items = {}
                return new Promise<Item[]>(() => [])
            }

            if (!Array.isArray(items)) {
                this.items[items.getId()] = items
            } else {
                this.items = Object.assign(this.items, ...items.map((item: Item) => ({[item.getId()]: item})))
            }
            return setCachedItem('items', [...this.getItemsAsList])
        },
        /**
         * Update a single item
         * @param item
         */
        setItem(item: Item) {
            this.items[item.getId()] = item
        },
        /**
         * Remove a single item
         * @param item
         */
        removeItem(item: Item) {
            delete this.items[item.getId()]
        },
        /**
         * Set the loading state
         * @param key
         */
        setLoadingState(key: string) {
            this.loading[key] = true
        },
        /**
         * Finish the loading state
         * @param key
         */
        finishLoading(key: string) {
            this.loading[key] = false
        },
        /**
         * Fetch the recipes from the API and store them in the store
         */
        async fetchRecipes(): Promise<Recipe[]> {
            logDebug('fetchRecipes', 'fetching recipes')
            this.setLoadingState('fetchRecipes')
            return sendToAPI<Recipe[]>(API_ROUTE.GET_RECIPES, {errorMessage: 'Could not fetch recipes'})
                .then((apiResponse: APIResponse<Recipe[]>) => {
                    // map the recipes JSON to Recipe objects
                    // this is because the JSON is not a valid Recipe object,
                    // and we need to use the Recipe class methods
                    if (!apiResponse.error) {
                        Promise.all(apiResponse.response.map((recipe: Recipe) => recipeFromJSON(recipe)))
                            .then((recipes: Recipe[]) => this.replaceRecipes(recipes))
                    }
                    this.finishLoading('fetchRecipes')
                    return apiResponse.response
                });
        },
        async fetchItems(): Promise<Item[]> {
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
                    }
                    this.finishLoading('fetchItems')
                    return apiResponse.response
                });
        }
    },
})
