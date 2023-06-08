// Ionic
import { Storage } from '@ionic/storage';

// Vue
import { App, InjectionKey } from 'vue'
import { createStore, Store, useStore as baseUseStore } from 'vuex';

// Types
import { Discount, Item, Recipe, RecipeSuggestion, RecipeSuggestionQuery } from '@/tastebuddy/types';
import { API_ROUTE, DURATIONS } from '@/tastebuddy/constants';
import { APIResponse, logDebug, logError, presentToast, sendToAPI } from '@/tastebuddy';


// Type the store to use benefits of TypeScript
// https://vuex.vuejs.org/guide/typescript-support.html

// Define typings for the store state
export interface State {
    user: {
        username?: string,
        authenticated: boolean,
    }
    isLoading: { [key: string]: boolean },
    recipes: { [id: string]: Recipe },
    recipeSuggestions: Recipe[],
    items: { [id: string]: Item },
    recipesByItemId: { [itemId: string]: string[] },
}

// Define injection key
export const storeKey: InjectionKey<Store<State>> = Symbol("Taste Buddy Store")

// Custom Vuex Store
// https://vuex.vuejs.org/guide/typescript-support.html#simplifying-usestore-usage
export function useTasteBuddyStore() {
    return baseUseStore(storeKey)
}

// Create the store
// called by main.ts
export function createTasteBuddyStore() {
    return createStore<State>({
        state: {
            user: {
                authenticated: false
            },
            isLoading: {},
            recipes: {},
            recipeSuggestions: [],
            items: {},
            recipesByItemId: {},
        },
        mutations: {
            addLoading(state, key: string) {
                state.isLoading[key] = true
            },
            finishLoading(state, key: string) {
                state.isLoading[key] = false
            },
            setAuthenticated(state, authenticated: boolean) {
                state.user.authenticated = authenticated
            },
            setRecipes(state, recipes: Recipe[]) {
                state.recipes = Object.assign({}, ...recipes.map((recipe: Recipe) => ({ [recipe.getId()]: recipe })))
            },
            updateRecipe(state, recipe: Recipe) {
                state.recipes[recipe.getId()] = recipe
            },
            removeRecipe(state, recipe: Recipe) {
                delete state.recipes[recipe.getId()]
            },
            setRecipeSuggestions(state, recipeSuggestions: string[]) {
                state.recipeSuggestions = recipeSuggestions.map((recipeId: string) => state.recipes[recipeId])
            },
            setItems(state, items: Item[]) {
                state.items = Object.assign({}, ...items.map((item: Item) => ({ [item.getId()]: item })))
            },
            updateItem(state, item: Item) {
                state.items[item.getId()] = item
            },
            removeItem(state, item: Item) {
                delete state.items[item.getId()]
            },
            mapRecipeIdsToItemIds(state, recipes: Recipe[]) {
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

                state.recipesByItemId = recipesByItemId
            }
        },
        actions: {
            /**
             * Authenticate the user using the session cookie
             * @param commit
             */
            sessionAuth({ commit, getters }) {
                logDebug('sessionAuth', 'logging in')
                // if the user is already authenticated, return true
                if (getters.isAuthenticated) {
                    return Promise.resolve(true)
                }

                // try to authenticate the user using the session cookie
                return sendToAPI<string>(API_ROUTE.GET_AUTH, { errorMessage: 'Could not log in' })
                    .then((apiResponse: APIResponse<string>) => {
                        commit('setAuthenticated', !apiResponse.error)
                        return !apiResponse.error
                    })
            },
            /**
             * Authenticate the user using the username and password
             * @param commit
             * @param payload username and password
             * @returns true if the authentication was successful, false otherwise
             */
            basicAuth({ commit }, payload: { username: string, password: string }): Promise<boolean> {
                logDebug('basicAuth', 'logging in')
                const { username, password } = payload
                return sendToAPI<string>(API_ROUTE.POST_AUTH, {
                    headers: [
                        {
                            key: 'Authorization',
                            value: 'Basic ' + btoa(username + ':' + password)
                        }
                    ],
                    errorMessage: 'Could not log in'
                }).then((apiResponse: APIResponse<string>) => {
                    commit('setAuthenticated', !apiResponse.error)
                    // return true if the authentication was successful, false otherwise
                    return !apiResponse.error
                })
            },
            /**
             * Fetch the recipes from the API and store them in the store
             * @param commit
             */
            fetchRecipes({ commit }) {
                commit('addLoading', 'fetchRecipes')
                logDebug('fetchRecipes', 'fetching recipes')
                return sendToAPI<Recipe[]>(API_ROUTE.GET_RECIPES, { errorMessage: 'Could not fetch recipes' })
                    .then((apiResponse: APIResponse<Recipe[]>) => {
                        // map the recipes JSON to Recipe objects
                        // this is because the JSON is not a valid Recipe object,
                        // and we need to use the Recipe class methods
                        if (!apiResponse.error) {
                            commit('setRecipes', apiResponse.response.map((recipe: Recipe) => Recipe.fromJSON(recipe)))
                        }
                        commit('finishLoading', 'fetchRecipes')
                    });
            },
            saveRecipeById({ commit, getters }, recipeId: string) {
                commit('addLoading', 'saveRecipeById')
                logDebug('saveRecipeById', recipeId)
                const recipe: Recipe = getters.getRecipeById[recipeId]
                if (typeof recipe === 'undefined') {
                    logError('Recipe not found: ', recipeId)
                    return
                }
                return this.dispatch('saveRecipe', recipe).then(() => {
                    commit('finishLoading', 'saveRecipeById')
                })
            },
            saveRecipe({ commit }, recipe: Recipe) {
                commit('addLoading', 'saveRecipe')
                logDebug('saveRecipe', recipe)
                commit('updateRecipe', recipe)
                return sendToAPI<string>(API_ROUTE.ADD_RECIPE, {
                    body: recipe,
                    errorMessage: 'Could not save recipe in database. Please retry later!'
                })
                    .then((apiResponse: APIResponse<string>) => {
                        presentToast(apiResponse.response, apiResponse.error, apiResponse.error ? DURATIONS.LONG : DURATIONS.SHORT)
                        return apiResponse
                    })
                    .then((apiResponse: APIResponse<string>) => {
                        commit('finishLoading', 'saveRecipe')
                        return apiResponse
                    }).then((apiResponse: APIResponse<string>) => {
                        if (!apiResponse.error) {
                            return this.dispatch('fetchRecipes')
                        }
                        return []
                    })
            },
            deleteRecipe({ commit }, recipe: Recipe) {
                commit('addLoading', 'deleteRecipe')
                logDebug('deleteRecipe', recipe)
                commit('removeRecipe', recipe)
                if (typeof recipe._id !== 'undefined') {
                    return sendToAPI<string>(API_ROUTE.DELETE_RECIPE, {
                        formatObject: { RECIPE_ID: recipe._id ?? '' },
                        errorMessage: `Could not delete recipe ${recipe._id} from database. Please retry later!`
                    }).then((apiResponse: APIResponse<string>) => {
                        commit('finishLoading', 'deleteRecipe')
                        return presentToast(apiResponse.response)
                    })
                }
            },
            /**
             * Fetch the suggestions for the recipe search
             * @param commit
             */
            fetchRecipeSuggestions({ commit }, query: RecipeSuggestionQuery) {
                commit('addLoading', 'fetchRecipeSuggestions')
                logDebug('fetchRecipeSuggestions', 'fetching recipe suggestions')
                return sendToAPI<string[]>(API_ROUTE.POST_SUGGEST_RECIPE, { body: query, errorMessage: 'Could not fetch recipe suggestions' })
                    .then((apiResponse: APIResponse<RecipeSuggestion[]>) => {
                        // map the recipes JSON to Recipe objects
                        // this is because the JSON is not a valid Recipe object,
                        // and we need to use the Recipe class methods
                        if (!apiResponse.error) {
                            commit('setRecipeSuggestions', apiResponse.response)
                        }
                        commit('finishLoading', 'fetchRecipeSuggestions')
                    });
            },
            fetchItems({ commit }) {
                commit('addLoading', 'fetchItems')
                logDebug('fetchItems', 'fetching items')
                return sendToAPI<Item[]>(API_ROUTE.GET_ITEMS, { errorMessage: 'Could not fetch items' })
                    .then((apiResponse: APIResponse<Item[]>) => {
                        // map the items JSON to Item objects
                        // this is because the JSON is not a valid Item object,
                        // and we need to use the Item class methods
                        if (!apiResponse.error) {
                            commit('setItems', apiResponse.response.map((item: Item) => Item.fromJSON(item)))
                        }
                        commit('finishLoading', 'fetchItems')
                    });
            },
            saveItem({ commit }, item: Item) {
                logDebug('saveItem', item)
                commit('updateItem', item)
                return sendToAPI<string>(API_ROUTE.ADD_ITEM, {
                    body: item,
                    errorMessage: 'Could not save item in database. Please retry later!'
                })
                    .then((apiResponse: APIResponse<string>) => {
                        if (!apiResponse.error) {
                            this.dispatch('fetchItems')
                        }
                    });
            },
            deleteItem({ commit }, item: Item) {
                logDebug('deleteItem', item)
                commit('removeItem', item)
                if (typeof item._id !== 'undefined') {
                    return sendToAPI<string>(API_ROUTE.DELETE_ITEM, {
                        formatObject: { ITEM_ID: item._id ?? '' },
                        errorMessage: `Could not delete item ${item._id} from database. Please retry later!`
                    }).then((apiResponse: APIResponse<string>) => {
                        return presentToast(apiResponse.response)
                    })
                }
            },
            mapRecipeIdsToItemIds({ commit, getters }) {
                logDebug('mapRecipeIdsToItemIds', 'mapping recipe ids to item ids')
                commit('mapRecipeIdsToItemIds', getters.getRecipesAsList)
            }
        },
        getters: {
            isLoading(state): boolean {
                return Object.values(state.isLoading).some((isLoading: boolean) => isLoading)
            },
            /**
             * Get the current app state
             * @param state 
             * @returns 
             */
            isDevMode(_): boolean {
                return process.env.NODE_ENV === 'development'
            },
            /**
             * Get the user's username
             * @param state
             */
            getUsername(state): string {
                return state.user.username ?? ''
            },
            /**
             * Check if the user is authenticated
             * @param state
             */
            isAuthenticated(state): boolean {
                return state.user.authenticated ?? false
            },
            /**
             * Get the recipes as list
             * @param state
             */
            getRecipesAsList(state): Recipe[] {
                const recipesAsArray: Recipe[] = Object.values(state.recipes ?? {})
                return recipesAsArray.sort((a: Recipe, b: Recipe) => a.name.localeCompare(b.name))
            },
            /**
             * Get the recipes mapped by their id
             * @param state
             */
            getRecipesAsMap(state): { [id: string]: Recipe } {
                return state.recipes ?? {}
            },
            /**
             * Get the recipes by the item id
             * @param state
             */
            getRecipesAsListByItemId: (state) => (itemId?: string): string[] => {
                return state.recipesByItemId[itemId ?? ''] ?? []
            },
            /**
             * Get the recipe suggestions
             * @param state
             * @returns a list of recipes
             */
            getRecipeSuggestions(state): Recipe[] {
                return state.recipeSuggestions ?? []
            },
            /**
             * Get the items
             * @param state
             */
            getItems(state): Item[] {
                const itemsAsArray: Item[] = Object.values(state.items ?? {})
                return itemsAsArray.sort((a: Item, b: Item) => a.name.localeCompare(b.name))
            },
            getItemsById(state): { [id: string]: Item } {
                return state.items ?? {}
            },
            getTags(_, getters): string[] {
                return getters.getRecipesAsList.reduce((tags: string[], recipe: Recipe) => {
                    return [...tags, ...(recipe.props.tags ?? [])]
                }, [])
            },
        },
    })
}


// Create Vue plugin for Ionic storage
// https://stackoverflow.com/a/69043844
export async function ionicStorageVuePlugin(app: App) {
    const storage = new Storage()
    const storageInstance = await storage.create()

    app.config.globalProperties.$ionicStorage = storageInstance
    // Access the ionic storage instance in Vuex store actions
    app.config.globalProperties.$store.$ionicStorage = storageInstance
}
