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
export const storeKey: InjectionKey<Store<State>> = Symbol()

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
            setRecipes(state, recipes) {
                state.recipes = recipes
            },
            setItems(state, items) {
                state.items = items
            },
            setDiscounts(state, payload: { city: string, discounts: Discount[] }) {
                const { city, discounts } = payload
                state.discounts[city] = discounts
            },
            mapRecipeIdsToItemIds(state, recipes) {
                state.recipesByItemId = recipes
                    .reduce((recipesIdByItemId: { [itemId: string]: string[] }, recipe: Recipe) => {
                        getItemsFromRecipe(recipe)
                            .forEach((item: Item) => {
                                if (typeof item._id !== 'undefined' && typeof recipe._id !== 'undefined') {
                                    if (typeof recipesIdByItemId[item._id] === 'undefined') {
                                        recipesIdByItemId[item._id] = []
                                    }
                                    recipesIdByItemId[item._id].push(recipe._id)
                                }
                            })

                        return recipesIdByItemId
                    }, {})
            }
        },
        actions: {
            async fetchRecipes({ commit }) {
                getFromAPI(API_ROUTE.GET_RECIPES, {
                    callback: (json: Recipe[]) => {
                        commit('setRecipes', json)
                    }
                });
            },
            async fetchItems({ commit }) {
                getFromAPI(API_ROUTE.GET_ITEMS, {
                    callback: (json: Item[]) => {
                        commit('setItems', json)
                    }
                });
            },
            async fetchDiscounts({ commit }, city: string) {
                getFromAPI(API_ROUTE.GET_DISCOUNTS, {
                    callback: (json: Discount[]) => {
                        commit('setDiscounts', { discounts: json, city })
                    }, formatObject: { CITY: city }
                });
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