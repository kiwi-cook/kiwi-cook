// Vue
import {defineStore} from 'pinia'

// Types
// Ionic
import {Drivers, Storage} from '@ionic/storage';
import {
    API_ROUTE,
    APIResponse,
    Item,
    logDebug,
    logError,
    presentToast,
    Recipe,
    RecipeSuggestion,
    RecipeSuggestionQuery,
    sendToAPI
} from "@/tastebuddy";

const ionicStorage = new Storage({
    name: '__mydb',
    driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage]
});
await ionicStorage.create();

// Define typings for the store state

interface UserState {
    user: {
        authenticated: boolean
    },
    language: {
        lang: string,
        supportedLanguages: string[]
    }
}

export const useTasteBuddyStore = defineStore('tastebuddy', {
    state: (): UserState => ({
        user: {
            authenticated: false
        },
        language: {
            lang: 'en',
            supportedLanguages: ['en', 'de']
        }
    }),
    getters: {
        /**
         * Get the current app state
         * @returns
         */
        isDevMode: (): boolean => process.env.NODE_ENV === 'development',
        isAuthenticated: (state): boolean => state.user.authenticated ?? false,
    },
    actions: {
        /**
         * Change the language
         * @param language
         */
        changeLanguage(language: string) {
            this.language.lang = this.language.supportedLanguages.includes(language) ? language : 'en'
        },
        /**
         * Authenticate the user using the session cookie
         */
        async sessionAuth() {
            logDebug('sessionAuth', 'logging in')
            // if the user is already authenticated, return true
            if (this.isAuthenticated) {
                return Promise.resolve(true)
            }

            // try to authenticate the user using the session cookie
            return sendToAPI<string>(API_ROUTE.GET_AUTH, {errorMessage: 'Could not log in'})
                .then((apiResponse: APIResponse<string>) => {
                    logDebug('sessionAuth', `got response: ${JSON.stringify(apiResponse)}`)
                    this.user.authenticated = !apiResponse.error
                    return !apiResponse.error
                })
        },
        /**
         * Authenticate the user using the username and password
         * @param payload username and password
         * @returns true if the authentication was successful, false otherwise
         */
        async basicAuth(payload: { username: string, password: string }): Promise<boolean> {
            logDebug('basicAuth', 'logging in')
            const {username, password} = payload
            return sendToAPI<string>(API_ROUTE.POST_AUTH, {
                headers: [
                    {
                        key: 'Authorization',
                        value: 'Basic ' + btoa(username + ':' + password)
                    }
                ],
                errorMessage: 'Could not log in'
            }).then((apiResponse: APIResponse<string>) => {
                logDebug('basicAuth', `got response: ${JSON.stringify(apiResponse)}`)
                this.user.authenticated = !apiResponse.error
                // return true if the authentication was successful, false otherwise
                return !apiResponse.error
            })
        },
    }
})

interface RecipeState {
    loading: { [key: string]: boolean }
    recipes: { [id: string]: Recipe }
    savedRecipes: Set<string>
    recipeSuggestions: RecipeSuggestion[]
    items: { [id: string]: Item }
    recipesByItemId: { [itemId: string]: string[] }
}

// Create the store
// called by main.ts
export const useRecipeStore = defineStore('recipes', {
    state: (): RecipeState => ({
        loading: {},
        recipes: {},
        savedRecipes: new Set(),
        recipeSuggestions: [],
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
            recipesAsList.sort((a: Recipe, b: Recipe) => a.name.localeCompare(b.name))
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

            recipes.forEach((recipe: Recipe) => {
                const items = recipe.getItems()
                items.forEach((item: Item) => {
                    if (!(item.getId() in recipesByItemId)) {
                        recipesByItemId[item.getId()] = []
                    }
                    recipesByItemId[item.getId()].push(recipe.getId())
                })
            })
            logDebug('getRecipesByItemIds', recipesByItemId)

            return recipesByItemId
        },
        /**
         * Get the recipes by the item id
         * @param state
         */
        getRecipesAsListByItemId: (state) => (itemId?: string): string[] => state.recipesByItemId[itemId ?? ''] ?? [],
        /**
         * Get the recipe suggestions
         * @param state
         * @returns a list of recipe suggestions
         */
        getRecipeSuggestions: (state): RecipeSuggestion[] => state.recipeSuggestions ?? [],
        /**
         * Get saved recipes
         * @param state
         * @returns a list of saved recipes
         */
        getSavedRecipes(state): Recipe[] {
            return [...state.savedRecipes.keys()].map((recipeId) => this.recipes[recipeId])
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
        getItems: (state): Item[] => {
            const itemsAsArray: Item[] = Object.values(state.items ?? {})
            itemsAsArray.sort((a: Item, b: Item) => a.name.localeCompare(b.name))
            return itemsAsArray
        },
        getItemsAsMap: (state): { [id: string]: Item } => state.items ?? {},
        getTags(): string[] {
            return this.getRecipesAsList.reduce((tags: string[], recipe: Recipe) => {
                return [...tags, ...(recipe.props.tags ?? [])]
            }, [])
        },
        async cacheIsOld(): Promise<boolean> {
            return await ionicStorage.get('savedAt').then((savedAt: string) => (new Date().getTime() - new Date(savedAt).getTime()) > 1000 * 60 * 60 * 24)
        }
    },
    actions: {
        /**
         * Cache item in the Ionic Storage and set a timestamp
         * @param key
         * @param value
         */
        async setCachedItem(key: string, value: any) {
            return ionicStorage.set(key, {date: new Date().getTime(), value: value}).then(() => {
                logDebug('setCachedItem', `saved ${key} to cache`)
                return value
            })
        },
        /**
         * Get the cached item
         * @param key
         */
        async getCachedItem(key: string): Promise<{ value: any, isOld: boolean }> {
            return ionicStorage.get(key).then((cachedItem: {
                date: number,
                value: any
            }) => {
                if (!cachedItem || typeof cachedItem === 'undefined') {
                    return {value: null, isOld: true}
                }
                return {value: cachedItem.value, isOld: (new Date().getTime() - cachedItem?.date) > 1000 * 60 * 60 * 24}
            })
        },
        /**
         * Prepare the Ionic Storage by fetching the items and recipes
         * If the cache is old, the items and recipes are fetched from the API
         */
        async prepare() {
            this.setLoadingState('prepare')
            // fetch all items
            this.getCachedItem('items').then((cachedItem: { value: unknown[], isOld: boolean }) => {
                if (cachedItem.isOld) {
                    this.fetchItems()
                } else {
                    this.setItems((cachedItem.value as Item[]).map((item: Item) => Item.fromJSON(item)))
                }
            })
            // fetch all recipes
            this.getCachedItem('recipes').then((cachedItem: { value: unknown[], isOld: boolean }) => {
                if (cachedItem.isOld) {
                    this.fetchRecipes()
                } else {
                    this.setRecipes((cachedItem.value as Recipe[]).map((recipe: Recipe) => Recipe.fromJSON(recipe)))
                }
            })
            // fetch saved recipes
            this.getCachedItem('savedRecipes').then((cachedItem: { value: string[], isOld: boolean }) => {
                if (!cachedItem.isOld) {
                    this.setSavedRecipes(cachedItem.value)
                }
            })
            this.finishLoading('prepare')
        },
        /**
         * Override all recipes
         * @param recipes
         */
        setRecipes(recipes: Recipe[]) {
            this.recipes = Object.assign({}, ...recipes.map((recipe: Recipe) => ({[recipe.getId()]: recipe})))
            return this.setCachedItem('recipes', recipes)
        },
        /**
         * Update a single recipe
         * @param recipe
         */
        setRecipe(recipe: Recipe) {
            this.recipes[recipe.getId()] = recipe
        },
        /**
         * Remove or add a recipe to the saved recipes
         * @param recipe
         */
        setLike(recipe: Recipe) {
            if (recipe.isLiked) {
                this.savedRecipes.add(recipe.getId())
            } else {
                this.savedRecipes.delete(recipe.getId())
            }
            return this.setCachedItem('savedRecipes', [...this.savedRecipes])
        },
        /**
         * Override all saved recipes
         * @param savedRecipes
         */
        setSavedRecipes(savedRecipes: string[]) {
            this.savedRecipes = new Set(savedRecipes)
        },
        /**
         * Override all items
         * @param items
         */
        setItems(items: Item[]) {
            this.items = Object.assign({}, ...items.map((item: Item) => ({[item.getId()]: item})))
            return this.setCachedItem('items', items)
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
                        const recipes = apiResponse.response.map((recipe: Recipe) => Recipe.fromJSON(recipe))
                        this.setRecipes(recipes)
                    }
                    this.finishLoading('fetchRecipes')
                    return apiResponse.response
                });
        },
        saveRecipeById(recipeId: string) {
            logDebug('saveRecipeById', recipeId)
            this.setLoadingState('saveRecipeById')
            const recipe: Recipe = this.getRecipesAsMap[recipeId]
            if (typeof recipe === 'undefined') {
                logError('Recipe not found: ', recipeId)
                return
            }
            return this.saveRecipe(recipe).then(() => {
                this.finishLoading('saveRecipeById')
            })
        },
        async saveRecipe(recipe: Recipe) {
            logDebug('saveRecipe', recipe)
            this.setLoadingState('saveRecipe')
            this.setRecipe(recipe)
            return sendToAPI<string>(API_ROUTE.ADD_RECIPE, {
                body: recipe,
                errorMessage: 'Could not save recipe in database. Please retry later!',
                successMessage: 'Updated recipe'
            })
                .then((apiResponse: APIResponse<string>) => {
                    this.finishLoading('saveRecipe')
                    return apiResponse
                }).then((apiResponse: APIResponse<string>) => {
                    if (!apiResponse.error) {
                        return this.fetchItems().then(() => this.fetchRecipes())
                    }
                    return []
                })
        },
        async deleteRecipe(recipe: Recipe): Promise<void> {
            logDebug('deleteRecipe', recipe)
            this.setLoadingState('deleteRecipe')
            delete this.recipes[recipe.getId()]
            if (typeof recipe._id !== 'undefined') {
                return sendToAPI<string>(API_ROUTE.DELETE_RECIPE, {
                    formatObject: {RECIPE_ID: recipe._id ?? ''},
                    errorMessage: `Could not delete recipe ${recipe._id} from database. Please retry later!`
                }).then((apiResponse: APIResponse<string>) => {
                    this.finishLoading('deleteRecipe')
                    return presentToast(apiResponse.response)
                })
            }
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            return new Promise(() => {
            })
        },
        /**
         * Fetch the suggestions for the recipe search
         * @param query
         */
        async fetchRecipeSuggestions(query: RecipeSuggestionQuery): Promise<RecipeSuggestion[]> {
            logDebug('fetchRecipeSuggestions', 'fetching recipe suggestions')
            this.setLoadingState('fetchRecipeSuggestions')
            return sendToAPI<RecipeSuggestion[]>(API_ROUTE.POST_SUGGEST_RECIPE, {
                body: query,
                errorMessage: 'Could not fetch recipe suggestions'
            })
                .then((apiResponse: APIResponse<RecipeSuggestion[]>) => {
                    // map the recipes JSON to Recipe objects
                    // this is because the JSON is not a valid Recipe object,
                    // and we need to use the Recipe class methods
                    if (!apiResponse.error) {
                        this.recipeSuggestions = apiResponse.response.map((recipeSuggestion: RecipeSuggestion) => RecipeSuggestion.fromJSON(recipeSuggestion))
                    }
                    this.finishLoading('fetchRecipeSuggestions')
                    return this.getRecipeSuggestions
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
                        const items: Item[] = apiResponse.response.map((item: Item) => Item.fromJSON(item))
                        this.setItems(items)
                    }
                    this.finishLoading('fetchItems')
                    return apiResponse.response
                });
        },
        async saveItem(item: Item) {
            logDebug('saveItem', item)
            this.setLoadingState('saveItem')
            this.setItem(item)
            return sendToAPI<string>(API_ROUTE.ADD_ITEM, {
                body: item,
                errorMessage: 'Could not save item in database. Please retry later!'
            })
                .then((apiResponse: APIResponse<string>) => {
                    if (!apiResponse.error) {
                        return this.fetchItems()
                    }
                    this.finishLoading('saveItem')
                });
        },
        deleteItem(item: Item) {
            logDebug('deleteItem', item)
            this.setLoadingState('deleteItem')
            this.removeItem(item)
            if (typeof item._id !== 'undefined') {
                return sendToAPI<string>(API_ROUTE.DELETE_ITEM, {
                    formatObject: {ITEM_ID: item._id ?? ''},
                    errorMessage: `Could not delete item ${item._id} from database. Please retry later!`
                }).then((apiResponse: APIResponse<string>) => {
                    this.finishLoading('deleteItem')
                    return presentToast(apiResponse.response)
                })
            }
        }
    },
})
