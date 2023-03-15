// Data types for the API

import { State } from "@/storage";
import { descriptionToSteps } from "@/utility/recipeParser";
import { Store } from "vuex";

// types for recipe

export class Item {
    _id?: string;
    _isSaved?: boolean;
    _tmpId?: string;
    name: string;
    type: string;
    imgUrl: string;

    constructor() {
        this._isSaved = false
        // create a temporary id to identify the item in the store before it is saved
        this._tmpId = 'tmp' + Date.now().toString(16) + Math.random().toString(16).slice(2)
        this.name = 'New Item'
        this.type = 'ingredient'
        this.imgUrl = ''
    }

    /**
     * Get the id of the item
     * @returns the id of the item
     * @throws an error if the id is undefined
     */
    public getId(): string {
        // if the id is undefined, throw an error
        if (this._id === undefined && this._tmpId === undefined) {
            throw new Error("item id is undefined")
        }
        return this._id ?? this._tmpId as string
    }

    /**
     * Initialize an item from a json object
     * This is done because the json object does not have the methods of the class
     * 
     * @param json 
     * @returns a new recipe
     */
    static fromJSON(json: Item): Item {
        const item = new Item()
        item._id = json._id
        // remove the temporary id
        delete item._tmpId
        // if the id is undefined, throw an error
        if (item._id === undefined) {
            throw new Error("item id is undefined")
        }
        item._isSaved = true
        item.name = json.name
        item.type = json.type
        item.imgUrl = json.imgUrl
        return item
    }

    /**
     * Add a new item to the store
     * @returns the item to allow chaining
     */
    public static newItem(): Item {
        return new Item()
    }

    /**
     * Add a new item to the store with a given name
     * @param name
     * @returns the item to allow chaining
     */
    public static newItemFromName(name?: string): Item {
        const item = new Item()
        item.name = name ?? 'New Item'
        return item
    }

    /**
     * Update the item in the store
     * @param store 
     * @returns the item to allow chaining
     */
    public update(store: Store<State>): Item {
        store.commit('updateItem', this)
        return this
    }

    /**
     * Save the item to the database
     * @param store 
     * @returns the item to allow chaining
     */
    public save(store: Store<State>): Item {
        // remove the temporary id
        store.dispatch('saveItem', this)
        return this
    }

    /**
     * Delete the item from the database
     * @param store
     */
    public delete(store: Store<State>): void {
        store.dispatch('deleteItem', this)
    }
}

export class StepItem {
    amount: number;
    unit: string;
    item: Item;

    constructor(item?: Item) {
        this.amount = 1
        this.unit = 'pcs'
        this.item = item ?? new Item()
    }

    /**
     * Initialize an stepItem from a json object
     * This is done because the json object does not have the methods of the class
     * 
     * @param json 
     * @returns a new recipe
     */
    static fromJSON(json: StepItem): StepItem {
        const stepItem = new StepItem()
        stepItem.amount = json.amount
        stepItem.unit = json.unit
        stepItem.item = Item.fromJSON(json.item)
        return stepItem
    }
}

export class Step {
    items: StepItem[];
    imgUrl?: string;
    description: string;
    preparationTime?: number;
    additional?: { [key: string]: string; }

    constructor() {
        this.items = [new StepItem()]
        this.imgUrl = ''
        this.description = 'New step description'
        this.preparationTime = 0
    }

    /**
     * Initialize an stepItem from a json object
     * This is done because the json object does not have the methods of the class
     * 
     * @param json 
     * @returns a new recipe
     */
    static fromJSON(json: Step): Step {
        const item = new Step()
        item.items = json.items.map(item => StepItem.fromJSON(item))
        item.imgUrl = json.imgUrl
        item.description = json.description
        item.preparationTime = json.preparationTime
        item.additional = json.additional
        return item
    }

    /**
     * Create a step from a list of step items
     * @param stepItems 
     * @param description 
     * @returns a new step
     */
    public static fromStepItems(stepItems: StepItem[], description?: string): Step {
        const step = new Step()
        step.items = stepItems
        step.description = description ?? ''
        return step
    }

    /**
     * Generate a list of steps from a description
     * @param description 
     * @returns a list of steps
     */
    public static fromDescription(description: string): Step[] {
        return descriptionToSteps(description)
    }
}

export class Recipe {
    _id?: string;
    _isSaved?: boolean;
    _tmpId?: string;
    name: string;
    author: string;
    description: string;
    imgUrl: string;
    tags: string[];
    cookingTime: number;
    steps: Step[];

    constructor() {
        this._isSaved = false
        // create a temporary id to identify the recipe in the store before it is saved
        this._tmpId = 'tmp' + Date.now().toString(16) + Math.random().toString(16).slice(2)
        this.name = 'New Recipe'
        this.author = ''
        this.description = ''
        this.imgUrl = ''
        this.tags = []
        this.cookingTime = 10
        this.steps = [new Step()]
    }

    /**
     * Initialize a recipe from a json object
     * This is done because the json object does not have the methods of the class
     * 
     * @param json 
     * @returns a new recipe
     */
    public static fromJSON(json: Recipe): Recipe {
        const recipe = new Recipe()
        recipe._id = json._id
        delete recipe._tmpId
        // if the id is undefined, throw an error
        if (recipe._id === undefined) {
            throw new Error("recipe id is undefined")
        }
        recipe._isSaved = true
        recipe.name = json.name
        recipe.author = json.author
        recipe.description = json.description
        recipe.imgUrl = json.imgUrl
        recipe.tags = json.tags
        recipe.cookingTime = json.cookingTime
        recipe.steps = json.steps.map(step => Step.fromJSON(step))

        return recipe
    }

    /**
     * Get the id of the recipe
     * @returns the id of the recipe
     * @throws an error if the id is undefined
     */
    public getId(): string {
        // if the id is undefined, throw an error
        if (this._id === undefined && this._tmpId === undefined) {
            throw new Error("recipe id is undefined")
        }
        return this._id ?? this._tmpId as string
    }

    /**
     * Initialize a new recipe with a temporary id
     * @returns a new recipe with a temporary id
     */
    public static newRecipe(): Recipe {
        return new Recipe()
    }

    /**
     * Updates the recipe in the store
     * @param store 
     * @returns the recipe to allow chaining
     */
    public update(store: Store<State>): Recipe {
        console.debug('[Recipe] update', this.getId())
        store.commit('updateRecipe', this)
        return this
    }

    /**
     * Save the recipe to the database
     * @param store 
     * @returns the recipe to allow chaining
     */
    public save(store: Store<State>): Recipe {
        console.debug('[Recipe] save', this.getId())
        store.dispatch('saveRecipe', this)
        return this
    }

    public static saveById(store: Store<State>, id: string): void {
        console.debug('[Recipe] saveById', id)
        store.dispatch('saveRecipeById', id)
    }

    /**
     * Delete the recipe from the database
     * @param store 
     */
    public delete(store: Store<State>): void {
        console.debug('[Recipe] delete', this.getId())
        store.dispatch('deleteRecipe', this)
    }

    /**
     * Add a step to the recipe
     * @param step 
     * @param stepIndex 
     * @returns the recipe to allow chaining
     */
    public addStep(step?: Step, stepIndex?: number): Recipe {
        const _step: Step = step ?? new Step()

        if (stepIndex !== undefined) {
            // insert the step at the given index
            this.steps.splice(stepIndex + 1, 0, _step)
        } else {
            // add the step to the end
            this.steps.push(_step)
        }
        return this
    }

    /**
     * Add multiple steps to the recipe
     * @param steps 
     * @returns the recipe to allow chaining
     */
    public addSteps(steps: Step[]): Recipe {
        this.steps.push(...steps)
        return this
    }

    /**
     * Remove a step from the recipe
     * @param index 
     * @returns the recipe to allow chaining
     */
    public removeStep(index: number): Recipe {
        this.steps.splice(index, 1)
        return this
    }

    /**
     * Add an item to a step
     * @param options 
     * @returns the recipe to allow chaining
     */
    public addItem(stepIndex?: number, itemIndex?: number, item?: Item): { item: Item, recipe: Recipe } {
        item = item || new Item();
        const stepItem = new StepItem(item);

        if (stepIndex === undefined) {
            // add a new step if no step is specified
            this.steps[this.steps.length - 1].items.push(stepItem);
        } else if (itemIndex === undefined) {
            // add a new item to the step if no item is specified
            this.steps[stepIndex].items.push(stepItem);
        } else {
            // update the item at the specified index
            this.steps[stepIndex].items[itemIndex].item = item;
        }

        console.debug('addItem', { stepIndex, itemIndex, item, recipe: this })
        return { item, recipe: this };
    }

    /**
     * Get all unique items in the recipe
     * @returns a list of all items in the recipe
     */
    public getItems(): Item[] {
        // use a Set to remove duplicates: https://stackoverflow.com/a/14438954
        // use flatMap to get all items in the recipe
        return [...new Set(this.steps.flatMap((step: Step) => step.items.map((item: StepItem) => item.item)))]
    }

    /**
     * Add a tag to the recipe
     * @param tag 
     * @returns the recipe to allow chaining
     */
    public addTag(tag: string): Recipe {
        if (this.tags === undefined) {
            // initialize the tags array if it is undefined
            this.tags = []
        }
        this.tags.push(tag)
        return this
    }
}

// types for discounts

export type Discount = {
    _id: string;
    title: string;
    price: string;
    imageUrl: string;
    validUntil: number;
    internalMarketId: string;
    marketName: string;
    marketLocation: string;
}

export type Market = {
    _id: string;
    distributor: string;
    distributorSpecificId: string;
    name: string;
    city: string;
    location: string;
}