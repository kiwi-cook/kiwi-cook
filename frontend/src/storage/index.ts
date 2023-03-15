// Ionic
import { Storage } from '@ionic/storage';

// Vue
import { App } from 'vue'
import { InjectionKey } from 'vue'
import { createStore, useStore as baseUseStore, Store } from 'vuex';

// Types
import { Discount, Item, Recipe } from '@/api/types';
import { API_ROUTE } from '@/api/constants';
import { getFromAPI } from '@/api';
import { getItemsFromRecipe } from '@/api/utility';



// Type the store to use benefits of TypeScript
// https://vuex.vuejs.org/guide/typescript-support.html

// Define typings for the store state
export interface State {
    recipes: Recipe[],
    items: Item[],
    discounts: { [city: string]: Discount[] },
    recipesByItemId: { [itemId: string]: string[] }
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
export function createVueStore() {
    const store = createStore<State>({
        state: {
            recipes: [],
            items: [],
            discounts: {},
            recipesByItemId: {}
        },
        mutations: {
            setRecipes(state, recipes: Recipe[]) {
                state.recipes = recipes.sort((a: Recipe, b: Recipe) => a.name.localeCompare(b.name))
            },
            updateRecipe(state, recipe: Recipe) {
                // try to find the recipe in the list
                const recipeIndex = state.recipes.findIndex((r: Recipe) => (r._id === undefined && r._tmpId === recipe._tmpId) || (r._tmpId === undefined && r._id === recipe._id))
                console.log('recipeIndex', recipeIndex);
                console.log(state.recipes)
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
                const { city, discounts } = payload
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
            async fetchRecipes({ commit }) {
                getFromAPI<Recipe>(API_ROUTE.GET_RECIPES)
                    .then((recipes: Recipe[]) => {
                        // map the recipes JSON to Recipe objects
                        // this is because the JSON is not a valid Recipe object
                        // and we need to use the Recipe class methods
                        commit('setRecipes', recipes.map((recipe: Recipe) => Recipe.fromJSON(recipe)))
                    });
            },
            async saveRecipeById({ commit, getters }, recipeId: string) {
                const recipe: Recipe = getters.getRecipeById[recipeId]
                if (typeof recipe === 'undefined') {
                    console.error('Recipe not found: ', recipeId)
                    return
                }
                this.dispatch('saveRecipe', recipe)
            },
            async saveRecipe({ commit }, recipe: Recipe) {
                commit('updateRecipe', recipe)
                getFromAPI(API_ROUTE.ADD_RECIPE, {
                    body: recipe
                }).then(() => {
                    this.dispatch('fetchRecipes')
                });
            },
            async deleteRecipe({ commit }, recipe: Recipe) {
                commit('removeRecipe', recipe)
                if (typeof recipe._id !== 'undefined') {
                    getFromAPI(API_ROUTE.DELETE_RECIPE, {
                        formatObject: { RECIPE_ID: recipe._id ?? '' }
                    })
                }
            },
            async fetchItems({ commit }) {
                getFromAPI<Item>(API_ROUTE.GET_ITEMS)
                    .then((items: Item[]) => {
                        // map the items JSON to Item objects
                        // this is because the JSON is not a valid Item object
                        // and we need to use the Item class methods
                        commit('setItems', items.map((item: Item) => Item.fromJSON(item)))
                    });
            },
            async saveItem({ commit }, item: Item) {
                commit('updateItem', item)
                getFromAPI(API_ROUTE.ADD_ITEM, {
                    body: item
                }).then(() => {
                    this.dispatch('fetchItems')
                });
            },
            async deleteItem({ commit }, item: Item) {
                commit('removeItem', item)
                if (typeof item._id !== 'undefined') {
                    getFromAPI(API_ROUTE.DELETE_ITEM, {
                        formatObject: { ITEM_ID: item._id ?? '' }
                    })
                }
            },
            async fetchDiscounts({ commit }, city: string) {
                getFromAPI<Discount>(API_ROUTE.GET_DISCOUNTS, {
                    formatObject: { CITY: city }
                }).then((discounts: Discount[]) => {
                    commit('setDiscounts', { discounts, city })
                })
            },
            async mapRecipeIdsToItemIds({ commit, getters }) {
                commit('mapRecipeIdsToItemIds', getters.getRecipes)
            }
        },
        getters: {
            getRecipes(state): Recipe[] {
                return state.recipes ?? []
            },
            getRecipesById: (_, getters): { [recipeId: string]: Recipe } => {
                return getters.getRecipes.reduce((recipeMap: { [recipeId: string]: Recipe }, recipe: Recipe) => {
                    if (typeof recipe._id !== 'undefined') {
                        recipeMap[recipe._id] = recipe
                    }
                    return recipeMap
                }, {})
            },
            getItems(state): Item[] {
                return state.items ?? []
            },
            getDiscounts: (state) => (city: string): Discount[] => {
                return state.discounts[city] ?? []
            },
            getRecipesByItemId: (state) => (itemId?: string): string[] => {
                return state.recipesByItemId[itemId ?? ''] ?? []
            }
        },
    })

    return store
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
