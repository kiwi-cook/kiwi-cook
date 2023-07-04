// Ionic
// Vue
import {defineStore} from 'pinia'

// Types
import {Item, Recipe, RecipeSuggestion, RecipeSuggestionQuery} from '@/tastebuddy/types';
import {API_ROUTE, DURATIONS} from '@/tastebuddy/constants';
import {APIResponse, logDebug, logError, presentToast, sendToAPI} from '@/tastebuddy';

// Define typings for the store state

interface UserState {
    user: {
        authenticated: boolean
    }
}

export const useUserStore = defineStore('user', {
    state: (): UserState => ({
        user: {
            authenticated: false
        }
    }),
    getters: {
        isAuthenticated: (state): boolean => state.user.authenticated ?? false,
    },
    actions: {
        /**
         * Authenticate the user using the session cookie
         */
        sessionAuth() {
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
        basicAuth(payload: { username: string, password: string }): Promise<boolean> {
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
    recipeSuggestions: RecipeSuggestion[]
    items: { [id: string]: Item }
    recipesByItemId: { [itemId: string]: string[] }
}

// Create the store
// called by main.ts
export const useTasteBuddyStore = defineStore('recipes', {
    state: (): RecipeState => ({
        loading: {},
        recipes: {},
        recipeSuggestions: [],
        items: {},
        recipesByItemId: {},
    }),
    getters: {
        isLoading: (state): boolean => Object.values(state.loading).some((isLoading: boolean) => isLoading),
        /**
         * Get the current app state
         * @returns
         */
        isDevMode: (): boolean => process.env.NODE_ENV === 'development',
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
         * @returns a list of recipes
         */
        getRecipeSuggestions: (state): RecipeSuggestion[] => state.recipeSuggestions ?? [],
        /**
         * Get the items
         * @param state
         */
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
    },
    actions: {
        setRecipes(recipes: Recipe[]) {
            this.recipes = Object.assign({}, ...recipes.map((recipe: Recipe) => ({[recipe.getId()]: recipe})))
        },
        updateRecipe(recipe: Recipe) {
            this.recipes[recipe.getId()] = recipe
        },
        setItems(items: Item[]) {
            this.items = Object.assign({}, ...items.map((item: Item) => ({[item.getId()]: item})))
        },
        updateItem(item: Item) {
            this.items[item.getId()] = item
        },
        removeItem(item: Item) {
            delete this.items[item.getId()]
        },
        addLoading(key: string) {
            this.loading[key] = true
        },
        finishLoading(key: string) {
            this.loading[key] = false
        },
        /**
         * Fetch the recipes from the API and store them in the store
         */
        fetchRecipes(): Promise<Recipe[]> {
            this.addLoading('fetchRecipes')
            logDebug('fetchRecipes', 'fetching recipes')
            return sendToAPI<Recipe[]>(API_ROUTE.GET_RECIPES, {errorMessage: 'Could not fetch recipes'})
                .then((apiResponse: APIResponse<Recipe[]>) => {
                    // map the recipes JSON to Recipe objects
                    // this is because the JSON is not a valid Recipe object,
                    // and we need to use the Recipe class methods
                    if (!apiResponse.error) {
                        this.setRecipes(apiResponse.response.map((recipe: Recipe) => Recipe.fromJSON(recipe)))
                    }
                    this.finishLoading('fetchRecipes')
                    return apiResponse.response
                });
        },
        saveRecipeById(recipeId: string) {
            this.addLoading('saveRecipeById')
            logDebug('saveRecipeById', recipeId)
            const recipe: Recipe = this.getRecipesAsMap[recipeId]
            if (typeof recipe === 'undefined') {
                logError('Recipe not found: ', recipeId)
                return
            }
            return this.saveRecipe(recipe).then(() => {
                this.finishLoading('saveRecipeById')
            })
        },
        saveRecipe(recipe: Recipe) {
            this.addLoading('saveRecipe')
            logDebug('saveRecipe', recipe)
            this.updateRecipe(recipe)
            return sendToAPI<string>(API_ROUTE.ADD_RECIPE, {
                body: recipe,
                errorMessage: 'Could not save recipe in database. Please retry later!'
            })
                .then((apiResponse: APIResponse<string>) => {
                    presentToast(apiResponse.response, apiResponse.error, apiResponse.error ? DURATIONS.LONG : DURATIONS.SHORT)
                    return apiResponse
                })
                .then((apiResponse: APIResponse<string>) => {
                    this.finishLoading('saveRecipe')
                    return apiResponse
                }).then((apiResponse: APIResponse<string>) => {
                    if (!apiResponse.error) {
                        return this.fetchRecipes()
                    }
                    return []
                })
        },
        deleteRecipe(recipe: Recipe) {
            this.addLoading('deleteRecipe')
            logDebug('deleteRecipe', recipe)
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
        },
        /**
         * Fetch the suggestions for the recipe search
         * @param query
         */
        fetchRecipeSuggestions(query: RecipeSuggestionQuery): Promise<RecipeSuggestion[]> {
            this.addLoading('fetchRecipeSuggestions')
            logDebug('fetchRecipeSuggestions', 'fetching recipe suggestions')
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
        fetchItems(): Promise<Item[]> {
            this.addLoading('fetchItems')
            logDebug('fetchItems', 'fetching items')
            return sendToAPI<Item[]>(API_ROUTE.GET_ITEMS, {errorMessage: 'Could not fetch items'})
                .then((apiResponse: APIResponse<Item[]>) => {
                    // map the items JSON to Item objects
                    // this is because the JSON is not a valid Item object,
                    // and we need to use the Item class methods
                    if (!apiResponse.error) {
                        this.setItems(apiResponse.response.map((item: Item) => Item.fromJSON(item)))
                    }
                    this.finishLoading('fetchItems')
                    return apiResponse.response
                });
        },
        saveItem(item: Item) {
            logDebug('saveItem', item)
            this.updateItem(item)
            return sendToAPI<string>(API_ROUTE.ADD_ITEM, {
                body: item,
                errorMessage: 'Could not save item in database. Please retry later!'
            })
                .then((apiResponse: APIResponse<string>) => {
                    if (!apiResponse.error) {
                        return this.fetchItems()
                    }
                });
        },
        deleteItem(item: Item) {
            logDebug('deleteItem', item)
            this.addLoading('deleteItem')
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
