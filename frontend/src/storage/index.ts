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



// Type the store to use benefits of TypeScript
// https://vuex.vuejs.org/guide/typescript-support.html

// Define typings for the store state
export interface State {
    recipes: Recipe[],
    items: Item[],
    discounts: { [city: string]: Discount[] }
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
            discounts: {}
        },
        mutations: {
            setRecipes(state, recipes) {
                state.recipes = recipes
            },
            setItems(state, items) {
                state.items = items
            },
            setDiscounts(state, payload) {
                const { city, discounts } = payload
                state.discounts[city] = discounts
            }
        },
        actions: {
            async fetchRecipes({ commit }) {
                getFromAPI(API_ROUTE.GET_RECIPES, (json: Recipe[]) => {
                    commit('setRecipes', json)
                });
            },
            async fetchItems({ commit }) {
                getFromAPI(API_ROUTE.GET_ITEMS, (json: Item[]) => {
                    commit('setItems', json)
                });
            },
            async fetchDiscounts({ commit }, city: string) {
                getFromAPI(API_ROUTE.GET_DISCOUNTS, (json: Discount[]) => {
                    commit('setDiscounts', { discounts: json, city })
                }, { CITY: city });
            }
        },
        getters: {
            getRecipes(state): Recipe[] {
                return state.recipes ?? []
            },
            getItems(state): Item[] {
                return state.items ?? []
            },
            getDiscounts: (state) => (city: string): Discount[] => {
                return state.discounts[city] ?? []
            }
        }
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