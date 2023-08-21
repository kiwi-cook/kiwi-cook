// Vue
import {defineStore} from 'pinia'

// Types
// Ionic
import {Drivers, Storage} from '@ionic/storage';
import {Geolocation, Position} from '@capacitor/geolocation';
import {API_ROUTE, APIResponse, Item, logDebug, logError, presentToast, Recipe, sendToAPI} from "@/tastebuddy";

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
    logDebug('setCachedItem', `saving ${key} with size ${JSON.stringify(value).length}`)
    return ionicStorage.set(key, {date: new Date().getTime(), value: value}).then(() => {
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
async function getCachedItem<T>(key: string): Promise<{ value: T, isOld: boolean }> {
    return ionicStorage.get(key).then((cachedItem: {
        date: number,
        value: any
    }) => {
        if (!cachedItem || typeof cachedItem === 'undefined') {
            return {value: null, isOld: true}
        }
        return {value: cachedItem.value, isOld: (new Date().getTime() - cachedItem?.date) > MAX_CACHE_AGE}
    })
}

// Define typings for the store state

interface UserState {
    user: {
        authenticated: boolean
        position?: Position
    },
    language: {
        lang: string,
        supportedLanguages: string[]
    },
    greetings: string[][],
    cities: string[]
}

export const useTasteBuddyStore = defineStore('tastebuddy', {
    state: (): UserState => ({
        user: {
            authenticated: false,
            position: undefined
        },
        language: {
            lang: 'en',
            supportedLanguages: ['en', 'de']
        },
        greetings: [],
        cities: ['Tübingen', 'Stuttgart', 'Berlin', 'München', 'Hamburg', 'Köln', 'Frankfurt', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig', 'Bremen', 'Dresden', 'Hannover', 'Nürnberg', 'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Münster', 'Karlsruhe', 'Mannheim', 'Augsburg', 'Wiesbaden', 'Gelsenkirchen', 'Mönchengladbach', 'Braunschweig', 'Chemnitz', 'Kiel', 'Aachen', 'Halle', 'Magdeburg', 'Freiburg', 'Krefeld', 'Lübeck', 'Oberhausen', 'Erfurt', 'Mainz', 'Rostock', 'Kassel', 'Hagen', 'Hamm', 'Saarbrücken', 'Mülheim an der Ruhr', 'Potsdam', 'Ludwigshafen am Rhein', 'Oldenburg', 'Leverkusen', 'Osnabrück', 'Solingen', 'Heidelberg', 'Herne', 'Neuss', 'Darmstadt', 'Paderborn', 'Regensburg', 'Ingolstadt', 'Würzburg', 'Wolfsburg', 'Fürth', 'Ulm', 'Heilbronn', 'Pforzheim', 'Göttingen', 'Bottrop', 'Recklinghausen', 'Reutlingen', 'Koblenz', 'Bremerhaven', 'Bergisch Gladbach', 'Remscheid', 'Jena', 'Trier', 'Erlangen', 'Moers', 'Siegen', 'Hildesheim', 'Salzgitter', 'Cottbus', 'Gera', 'Kaiserslautern', 'Witten', 'Gütersloh', 'Schwerin', 'Iserlohn', 'Ludwigsburg', 'Hanau', 'Esslingen am Neckar', 'Zwickau', 'Düren', 'Ratingen', 'Flensburg', 'Villingen-Schwenningen', 'Lünen', 'Marl', 'Lüneburg', 'Dessau-Roßlau', 'Konstanz']
    }),
    getters: {
        /**
         * Get the current app state
         * @returns
         */
        isDevMode: (): boolean => process.env.NODE_ENV === 'development',
        /**
         * Get the current language
         * @param state
         */
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
        /**
         * Get the user's position
         */
        async getPosition() {
            const getPositionViaCapacitor = () => {
                Geolocation.getCurrentPosition().then((position: Position) => {
                    this.user.position = position
                }).catch((error) => {
                    logError('getGeolocation.getPositionViaCapacitor', error)
                })
            }

            const getPositionViaBrowser = () => {
                navigator.geolocation.getCurrentPosition((position: Position) => {
                    this.user.position = position
                }, (error) => {
                    logError('getGeolocation.getPositionViaBrowser', error)
                })
            }

            if (typeof navigator.geolocation !== 'undefined') {
                getPositionViaBrowser()
            } else {
                getPositionViaCapacitor()
            }
        },
        /**
         * Get the greetings
         */
        async getGreetings(): Promise<string[]> {
            logDebug('fetchGreetings', 'fetching greetings')
            let greetings: string[][] = []
            if (this.greetings.length > 0) {
                greetings = this.greetings
            } else {
                greetings = await getCachedItem<string[][]>('greetings').then(async (cachedGreetings) => {
                    if (cachedGreetings.isOld) {
                        return await fetch('https://raw.githubusercontent.com/taste-buddy/greetings/master/greetings.json').then(async (response) => {
                            return response.json().then((greetings: string[][]) => {
                                this.greetings = greetings
                                setCachedItem('greetings', greetings)
                                return greetings
                            })
                        })
                    }
                    return cachedGreetings.value
                })
            }
            return greetings[Math.floor(Math.random() * greetings.length)]
        }
    }
})

interface RecipeState {
    loading: { [key: string]: boolean }
    recipes: { [id: string]: Recipe }
    savedRecipes: Set<string>
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

            recipes.forEach((recipe: Recipe) => {
                const items = recipe.getStepItems()
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
        getItemsAsList: (state): Item[] => {
            return Object.values(state.items ?? {}) ?? []
        },
        getItemsSortedByName(): Item[] {
            const itemsAsArray = this.getItemsAsList ?? []
            itemsAsArray.sort((a: Item, b: Item) => a.getName().localeCompare(b.getName()))
            return itemsAsArray
        },
        getItemsAsMap: (state): { [id: string]: Item } => state.items ?? {},
        getTags(): string[] {
            return this.getRecipesAsList.reduce((tags: string[], recipe: Recipe) => {
                return [...tags, ...(recipe.props.tags ?? [])]
            }, [])
        }
    },
    actions: {
        /**
         * Prepare the Ionic Storage by fetching the items and recipes
         * If the cache is old, the items and recipes are fetched from the API
         */
        async prepare() {
            this.setLoadingState('prepare')
            // fetch all items
            getCachedItem<Item[]>('items').then((cachedItem: { value: Item[], isOld: boolean }) => {
                if (cachedItem.isOld) {
                    this.fetchItems()
                } else {
                    this.setItems((cachedItem.value as Item[]).map((item: Item) => Item.fromJSON(item)))
                }
            })
            // fetch all recipes
            getCachedItem<Recipe[]>('recipes').then((cachedItem: { value: Recipe[], isOld: boolean }) => {
                if (cachedItem.isOld) {
                    this.fetchRecipes()
                } else {
                    this.replaceRecipes((cachedItem.value as Recipe[]).map((recipe: Recipe) => Recipe.fromJSON(recipe)))
                }
            })
            // fetch saved recipes
            getCachedItem<string[]>('savedRecipes').then((cachedItem: { value: string[], isOld: boolean }) => {
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
        replaceRecipes(recipes: Recipe[]) {
            this.recipes = Object.assign({}, ...recipes.map((recipe: Recipe) => ({[recipe.getId()]: recipe})))
            return setCachedItem('recipes', recipes)
        },
        /**
         * Update multiple recipes
         * @param recipes
         */
        setRecipes(recipes: Recipe[] | Recipe) {
            if (!Array.isArray(recipes)) {
                this.recipes[recipes.getId()] = recipes
            } else {
                this.recipes = Object.assign(this.recipes, ...recipes.map((recipe: Recipe) => ({[recipe.getId()]: recipe})))
            }
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
            return setCachedItem('savedRecipes', [...this.savedRecipes])
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
        setItems(items: Item[] | Item) {
            if (!Array.isArray(items)) {
                this.items[items.getId()] = items
            } else {
                this.items = Object.assign(this.items, ...items.map((item: Item) => ({[item.getId()]: item})))
            }
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
                        this.replaceRecipes(recipes)
                    }
                    this.finishLoading('fetchRecipes')
                    return apiResponse.response
                });
        },
        async saveRecipes(recipes?: Recipe[] | Recipe) {
            // if the recipes is not defined, save all recipes
            if (typeof recipes === 'undefined') {
                recipes = Object.values(this.getRecipesAsMap)
            }

            // if the recipes is not an array, make it an array
            if (!Array.isArray(recipes)) {
                recipes = [recipes]
            }

            logDebug('saveRecipe', recipes)
            this.setLoadingState('saveRecipe')
            this.setRecipes(recipes)
            return sendToAPI<string>(API_ROUTE.ADD_RECIPE, {
                body: recipes,
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
        async saveItems(items?: Item[] | Item) {
            // if the recipes is not defined, save all recipes
            if (typeof items === 'undefined') {
                items = Object.values(this.getItemsAsMap)
            }

            // if the recipes is not an array, make it an array
            if (!Array.isArray(items)) {
                items = [items]
            }

            logDebug('saveItem', items)
            this.setLoadingState('saveItem')
            this.setItems(items)
            return sendToAPI<string>(API_ROUTE.ADD_ITEM, {
                body: items,
                errorMessage: 'Could not save item in database. Please retry later!'
            }).then((apiResponse: APIResponse<string>) => {
                this.finishLoading('saveItem')
                return apiResponse
            })
                .then((apiResponse: APIResponse<string>) => {

                    if (!apiResponse.error) {
                        return this.fetchItems()
                    }
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
