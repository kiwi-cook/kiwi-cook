// Data types for the API

import {State} from "@/storage";
import {descriptionToSteps} from "@/utility/recipeParser";
import {Store} from "vuex";
import { log, logDebug } from ".";

// types for recipe

/**
 * Item of a recipe
 * It can be an ingredient or a tool
 */
export class Item {
    _id?: string;
    _isSaved?: boolean;
    _tmpId?: string;
    name: string;
    type: string;
    imgUrl: string;

    constructor(item?: Item) {
        this._isSaved = false
        // create a temporary id to identify the item in the store before it is saved
        this._tmpId = item?._tmpId ?? `tmp${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`
        this.name = item?.name ?? 'New Item'
        this.type = item?.type ?? 'ingredient'
        this.imgUrl = item?.imgUrl ?? ''
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

/**
 * StepItem of a recipe
 * It is an item with an amount and a unit
 * It is used in a step
 * This is done to make the item reusable
 */
export class StepItem extends Item {
    amount: number;
    unit: string;

    constructor(item?: Item) {
        super(item)
        this.amount = 1
        this.unit = 'pcs'
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
        stepItem._id = json._id
        stepItem._isSaved = json._isSaved
        stepItem.name = json.name
        stepItem.type = json.type
        stepItem.imgUrl = json.imgUrl
        return stepItem
    }

    /**
     * Update the item in the step
     * @param item
     */
    updateItem(item: Item): void {
        this._id = item._id
        this._isSaved = item._isSaved
        this.name = item.name
        this.type = item.type
        this.imgUrl = item.imgUrl
    }
}

export type BakingStepInformation = {
    informationType: "baking";
    temperature: string;
    duration: string;
    bakingType: string;
}

export type AdditionalStepInformation = BakingStepInformation | { [key: string]: string }

/**
 * Step of a recipe
 * It is a step with a list of StepItems
 * It can have an image, a description and a preparation time for the step
 */
export class Step {
    items: StepItem[];
    imgUrl?: string;
    description: string;
    duration?: number;
    additional?: AdditionalStepInformation

    constructor() {
        this.items = [new StepItem()]
        this.imgUrl = ''
        this.description = 'New step description'
        this.duration = 0
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
        item.items = json.items?.map(item => StepItem.fromJSON(item)) ?? []
        item.imgUrl = json.imgUrl
        item.description = json.description
        item.duration = json.duration
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

    /**
     * Get all unique items in the step
     * @returns a list of all items in the step
     */
    public getItems(): Item[] {
        // use a Set to remove duplicates: https://stackoverflow.com/a/14438954
        // use flatMap to get all items in the recipe
        const items: Item[] = this.items.flatMap((item: StepItem) => item)
        return [...new Set(items)]
    }

    /**
     * Get all step items in the step
     * @returns a list of all step items in the step
     */
    public getStepItems(): StepItem[] {
        return [...new Set(this.items)]
    }
}

/**
 * Recipe
 * It is a recipe with a list of steps
 * It contains all the information about a recipe
 */
export class Recipe {
    _id?: string;
    _isSaved?: boolean;
    _tmpId?: string;
    name: string;
    author: string;
    description: string;
    steps: Step[];
    props: {
        url?: string;
        imgUrl?: string;
        duration?: number;
        createdAt: Date;
        tags?: string[];
        likes: number;
    };

    constructor() {
        this._isSaved = false
        // create a temporary id to identify the recipe in the store before it is saved
        this._tmpId = `tmp${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`
        this.name = 'New Recipe'
        this.author = ''
        this.description = ''
        this.props = {
            url: '',
            imgUrl: '',
            duration: 0,
            createdAt: new Date(),
            tags: [],
            likes: 0
        }
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
        recipe.steps = json.steps?.map(step => Step.fromJSON(step)) ?? [new Step()]
        // props
        recipe.props.imgUrl = json.props.imgUrl
        recipe.props.tags = json.props.tags
        recipe.props.duration = json.props.duration
        recipe.props.createdAt = new Date(json.props.createdAt)
        recipe.props.likes = json.props.likes

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
     * Save the recipe to the database by its id
     * @param store
     * @param id
     */
    public static saveById(store: Store<State>, id: string): void {
        logDebug('saveById', id)
        store.dispatch('saveRecipeById', id)
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

    public getDuration(): number {
        return this.steps.reduce((acc, step) => acc + (step.duration ?? 0), 0)
    }

    /**
     * Updates the recipe in the store
     * @param store
     * @returns the recipe to allow chaining
     */
    public update(store: Store<State>): Recipe {
        logDebug('update', this.getId())
        store.commit('updateRecipe', this)
        return this
    }

    /**
     * Save the recipe to the database
     * @param store
     * @returns the recipe to allow chaining
     */
    public save(store: Store<State>): Recipe {
        logDebug('save', this.getId())
        store.dispatch('saveRecipe', this)
        return this
    }

    /**
     * Delete the recipe from the database
     * @param store
     */
    public delete(store: Store<State>): void {
        logDebug('delete', this.getId())
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
     * @param stepIndex index of the step
     * @param itemIndex index of the item
     * @param item the item to add
     * @returns the recipe to allow chaining
     */
    public addItem(stepIndex?: number, itemIndex?: number, item?: Item): { item: Item, recipe: Recipe } {
        item = item || new Item();
        const stepItem = new StepItem();

        if (stepIndex === undefined) {
            // add a new step if no step is specified
            this.steps[this.steps.length - 1].items.push(stepItem);
        } else if (itemIndex === undefined) {
            // add a new item to the step if no item is specified
            this.steps[stepIndex].items.push(stepItem);
        } else {
            // update the item at the specified index
            this.steps[stepIndex].items[itemIndex] = new StepItem(item);
        }
        return {item, recipe: this};
    }

    /**
     * Get all unique items in the recipe
     * @returns a list of all items in the recipe
     */
    public getItems(sorted = false): Item[] {
        // use a Set to remove duplicates: https://stackoverflow.com/a/14438954
        // use flatMap to get all items in the recipe
        const items = this.getStepItems().map(stepItem => stepItem)
        const uniqueItems: { [key: string]: Item } = {}
        items.forEach(item => {
            uniqueItems[item.getId()] = item
        })
        const result = Object.values(uniqueItems)
        if (sorted) {
            result.sort((a, b) => a.name.localeCompare(b.name))
        }
        return result
    }

    /**
     * Get all unique stepItems in the recipe
     * @param sorted sort the items by name
     */
    public getStepItems(sorted = false): StepItem[] {
        const items = this.steps.flatMap((step: Step) => step.getStepItems())
        const uniqueItems: { [key: string]: StepItem } = {}
        items.forEach(item => {
            uniqueItems[item.getId()] = item
        })
        const result = Object.values(uniqueItems)
        if (sorted) {
            result.sort((a, b) => a.name.localeCompare(b.name))
        }
        return result
    }

    /**
     * Add a tag to the recipe
     * @param tag
     * @returns the recipe to allow chaining
     */
    public addTag(tag: string): Recipe {
        if (this.props.tags === undefined) {
            // initialize the tags array if it is undefined
            this.props.tags = []
        }
        this.props.tags.push(tag)
        return this
    }
}

// types for discounts

/**
 * A discount represents a discount on a product
 * It is a generic representation that is created by the backend based on the data from the different markets
 * The id is the id of the discount in the database
 */
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

/**
 * A market represents a market where a product is sold
 * It is a generic representation that is created by the backend based on the data from the different markets
 * The id is the id of the market in the database
 */
export type Market = {
    _id: string;
    distributor: string;
    distributorSpecificId: string;
    name: string;
    city: string;
    location: string;
}