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
        this._tmpId = 'tmp' + Date.now().toString(16)
        this.name = 'New Item'
        this.type = 'ingredient'
        this.imgUrl = ''
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
    public static newItemFromName(name: string): Item {
        const item = new Item()
        item.name = name
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
}

export class Step {
    items: StepItem[];
    description: string;

    constructor() {
        this.items = [new StepItem()]
        this.description = 'New step description'
    }

    public static fromStepItems(stepItems: StepItem[], description?: string): Step {
        const step = new Step()
        step.items = stepItems
        step.description = description ?? ''
        return step
    }

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
        this._tmpId = 'tmp' + Date.now().toString(16)
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
        recipe._isSaved = true
        recipe.name = json.name
        recipe.author = json.author
        recipe.description = json.description
        recipe.imgUrl = json.imgUrl
        recipe.tags = json.tags
        recipe.cookingTime = json.cookingTime
        recipe.steps = json.steps

        return recipe
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
        store.commit('updateRecipe', this)
        return this
    }

    /**
     * Save the recipe to the database
     * @param store 
     * @returns the recipe to allow chaining
     */
    public save(store: Store<State>): Recipe {
        // remove the temporary id
        store.dispatch('saveRecipe', this)
        return this
    }

    /**
     * Delete the recipe from the database
     * @param store 
     */
    public delete(store: Store<State>): void {
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
            this.steps.splice(stepIndex, 0, _step)
        } else {
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
            this.steps[this.steps.length - 1].items.push(stepItem);
        } else if (itemIndex === undefined) {
            this.steps[stepIndex].items.push(stepItem);
        } else {
            this.steps[stepIndex].items[itemIndex] = stepItem;
        }

        console.debug('addItem', { stepIndex, itemIndex, item, recipe: this })
        return { item, recipe: this };
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