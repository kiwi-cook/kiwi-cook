// Ionic
import {Storage} from '@ionic/storage';

// Vue
import {App, InjectionKey} from 'vue'
import {createStore, Store, useStore as baseUseStore} from 'vuex';

// Types
import {Discount, Item, Recipe} from '@/tastebuddy/types';
import {API_ROUTE} from '@/tastebuddy/constants';
import {APIResponse, log, logDebug, logError, presentToast, sendToAPI} from '@/tastebuddy';


// Type the store to use benefits of TypeScript
// https://vuex.vuejs.org/guide/typescript-support.html

// Define typings for the store state
export interface State {
    user: {
        username?: string,
        authenticated: boolean,
    }
    recipes: Recipe[],
    items: Item[],
    discounts: { [city: string]: Discount[] },
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
            recipes: [],
            items: [],
            discounts: {},
            recipesByItemId: {},
        },
        mutations: {
            setAuthenticated(state, authenticated: boolean) {
                state.user.authenticated = authenticated
            },
            setRecipes(state, recipes: Recipe[]) {
                recipes.sort((a: Recipe, b: Recipe) => a.name.localeCompare(b.name))
                state.recipes = recipes
            },
            updateRecipe(state, recipe: Recipe) {
                // try to find the recipe in the list
                const recipeIndex = state.recipes.findIndex((r: Recipe) => (r._id === undefined && r._tmpId === recipe._tmpId) || (r._tmpId === undefined && r._id === recipe._id))
                if (recipeIndex !== -1) {
                    state.recipes[recipeIndex] = recipe
                } else {
                    state.recipes.push(recipe)
                }
                state.recipes = state.recipes.sort((a: Recipe, b: Recipe) => a.name.localeCompare(b.name))
            },
            removeRecipe(state, recipe: Recipe) {
                state.recipes = state.recipes.filter((r: Recipe) => r._id !== recipe._id)
            },
            setItems(state, items: Item[]) {
                state.items = items.sort((a: Item, b: Item) => a.name.localeCompare(b.name))
            },
            updateItem(state, item: Item) {
                // try to find the item in the list
                const itemIndex = state.items.findIndex((i: Item) => i._tmpId === item._tmpId || i._id === item._id)
                if (itemIndex !== -1) {
                    state.items[itemIndex] = item
                } else {
                    state.items.push(item)
                }
                state.items = state.items.sort((a: Item, b: Item) => a.name.localeCompare(b.name))
            },
            removeItem(state, item: Item) {
                state.items = state.items.filter((i: Item) => i._id !== item._id)
            },
            setDiscounts(state, payload: { city: string, discounts: Discount[] }) {
                const {city, discounts} = payload
                state.discounts[city] = discounts
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
            sessionAuth({commit}) {
                logDebug('sessionAuth', 'logging in')
                return sendToAPI<string>(API_ROUTE.GET_AUTH, {errorMessage: 'Could not log in'})
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
            basicAuth({commit}, payload: { username: string, password: string }): Promise<boolean> {
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
                    commit('setAuthenticated', !apiResponse.error)
                    // return true if the authentication was successful, false otherwise
                    return !apiResponse.error
                })
            },
            logout({commit}) {
                logDebug('logout', 'logging out')
                return sendToAPI<string>(API_ROUTE.POST_LOGOUT, {errorMessage: 'Could not log out'})
                    .then((apiResponse: APIResponse<string>) => {
                        commit('setAuthenticated', false)
                        return !apiResponse.error
                    })
            },
            /**
             * Fetch the recipes from the API and store them in the store
             * @param commit
             */
            fetchRecipes({commit}) {
                logDebug('fetchRecipes', 'fetching recipes')
                return sendToAPI<Recipe[]>(API_ROUTE.GET_RECIPES, {errorMessage: 'Could not fetch recipes'})
                    .then((apiResponse: APIResponse<Recipe[]>) => {
                        // map the recipes JSON to Recipe objects
                        // this is because the JSON is not a valid Recipe object,
                        // and we need to use the Recipe class methods
                        if (!apiResponse.error) {
                            commit('setRecipes', apiResponse.response.map((recipe: Recipe) => Recipe.fromJSON(recipe)))
                        }
                    });
            },
            saveRecipeById({getters}, recipeId: string) {
                logDebug('saveRecipeById', recipeId)
                const recipe: Recipe = getters.getRecipeById[recipeId]
                if (typeof recipe === 'undefined') {
                    logError('Recipe not found: ', recipeId)
                    return
                }
                this.dispatch('saveRecipe', recipe)
            },
            saveRecipe({commit}, recipe: Recipe) {
                logDebug('saveRecipe', recipe)
                commit('updateRecipe', recipe)
                return sendToAPI<string>(API_ROUTE.ADD_RECIPE, {
                    body: recipe,
                    errorMessage: 'Could not save recipe in database. Please retry later!'
                }).then((apiResponse: APIResponse<string>) => {
                    if (!apiResponse.error) {
                        this.dispatch('fetchRecipes')
                    }
                });
            },
            deleteRecipe({commit}, recipe: Recipe) {
                logDebug('deleteRecipe', recipe)
                commit('removeRecipe', recipe)
                if (typeof recipe._id !== 'undefined') {
                    return sendToAPI<string>(API_ROUTE.DELETE_RECIPE, {
                        formatObject: {RECIPE_ID: recipe._id ?? ''},
                        errorMessage: `Could not delete recipe ${recipe._id} from database. Please retry later!`
                    }).then((apiResponse: APIResponse<string>) => {
                        return presentToast(apiResponse.response)
                    })
                }
            },
            fetchItems({commit}) {
                logDebug('fetchItems', 'fetching items')
                return sendToAPI<Item[]>(API_ROUTE.GET_ITEMS, {errorMessage: 'Could not fetch items'})
                    .then((apiResponse: APIResponse<Item[]>) => {
                        // map the items JSON to Item objects
                        // this is because the JSON is not a valid Item object,
                        // and we need to use the Item class methods
                        if (!apiResponse.error) {
                            commit('setItems', apiResponse.response.map((item: Item) => Item.fromJSON(item)))
                        }
                    });
            },
            saveItem({commit}, item: Item) {
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
            deleteItem({commit}, item: Item) {
                logDebug('deleteItem', item)
                commit('removeItem', item)
                if (typeof item._id !== 'undefined') {
                    return sendToAPI<string>(API_ROUTE.DELETE_ITEM, {
                        formatObject: {ITEM_ID: item._id ?? ''},
                        errorMessage: `Could not delete item ${item._id} from database. Please retry later!`
                    }).then((apiResponse: APIResponse<string>) => {
                        return presentToast(apiResponse.response)
                    })
                }
            },
            fetchDiscounts({commit}, city: string) {
                logDebug('fetchDiscounts', 'fetching discounts')
                return sendToAPI<Discount[]>(API_ROUTE.GET_DISCOUNTS, {
                    formatObject: {CITY: city}
                }).then((apiResponse: APIResponse<Discount[]>) => {
                    if (!apiResponse.error) {
                        commit('setDiscounts', {discounts: apiResponse.response, city})
                    }
                })
            },
            mapRecipeIdsToItemIds({commit, getters}) {
                logDebug('mapRecipeIdsToItemIds', 'mapping recipe ids to item ids')
                commit('mapRecipeIdsToItemIds', getters.getRecipes)
            }
        },
        getters: {
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
             * Get the recipes
             * @param state
             */
            getRecipes(state): Recipe[] {
                return state.recipes ?? []
            },
            /**
             * Get the recipes mapped by their id
             * @param _
             * @param getters
             */
            getRecipesById: (_, getters): { [recipeId: string]: Recipe } => {
                return getters.getRecipes.reduce((recipeMap: { [recipeId: string]: Recipe }, recipe: Recipe) => {
                    if (typeof recipe._id !== 'undefined') {
                        recipeMap[recipe._id] = recipe
                    }
                    return recipeMap
                }, {})
            },
            /**
             * Get the recipes by the item id
             * @param state
             */
            getRecipesByItemId: (state) => (itemId?: string): string[] => {
                return state.recipesByItemId[itemId ?? ''] ?? []
            },
            /**
             * Get the items
             * @param state
             */
            getItems(state): Item[] {
                return state.items ?? []
            },
            /**
             * Get discounts
             * @param state
             */
            getDiscounts: (state) => (city: string): Discount[] => {
                return state.discounts[city] ?? []
            }
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
