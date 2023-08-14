// Data types for the API

import {logDebug, logError} from "@/tastebuddy";
import {CanShareResult, Share} from "@capacitor/share";
import {useRecipeStore, useTasteBuddyStore} from "@/storage";
import {useIonRouter} from "@ionic/vue";

// types for recipe

/**
 * Item of a recipe
 * It can be an ingredient or a tool
 */
export class Item {
    _id?: string;
    _tmpId?: string;
    name: string;
    type: string;
    imgUrl: string;
    names: { [lang: string]: string };

    constructor(item?: Item) {
        // create a temporary id to identify the item in the store before it is saved
        this._id = item?._id
        this._tmpId = item?._tmpId
        if (this._id === undefined) {
            this._tmpId = item?._tmpId ?? `tmp${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`
        }
        this.name = item?.name ?? 'New Item'
        this.type = item?.type ?? 'ingredient'
        this.imgUrl = item?.imgUrl ?? ''
        this.names = item?.names ?? {}
    }

    /**
     * Initialize an item from a json object
     * This is done because the json object does not have the methods of the class
     *
     * @param json
     * @returns a new item
     */
    public static fromJSON(json: Item): Item {
        const item = new Item()
        item._id = json._id
        // remove the temporary id
        delete item._tmpId
        item.name = json.name
        item.type = json.type
        item.imgUrl = json.imgUrl ?? ''
        item.names = json.names ?? {}
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
        logDebug("new item from name", item)
        return item
    }

    public getI18n(): { [lang: string]: string } {
        return this.names ?? {}
    }

    public getName(lang?: string): string {
        const store = useTasteBuddyStore()
        return this.getI18n()[lang ?? store.language.lang] ?? this.name
    }

    public setName(name: string, lang?: string): void {
        const store = useTasteBuddyStore()
        console.log(this.names, lang, store.language.lang)
        this.names[lang ?? store.language.lang] = name
        if (lang === undefined) {
            this.name = name
        }
    }

    /**
     * Get the id of the item
     * @returns the id of the item
     * @throws an error if the id is undefined
     */
    public getId(): string {
        // if the id is undefined, throw an error
        if (this._id === undefined && this._tmpId === undefined) {
            logError("item id is undefined", this)
            throw new Error("item id is undefined")
        }
        return this._id ?? this._tmpId as string
    }

    /**
     * Update the item in the store
     * @returns the item to allow chaining
     */
    public update(): this {
        logDebug("item.update", this.getId())
        const store = useRecipeStore()
        store.setItem(this)
        return this
    }

    /**
     * Save the item to the database
     * @returns the item to allow chaining
     */
    public save(): this {
        logDebug("item.save", this.getId())
        const store = useRecipeStore()
        store.saveItem(this)
        return this
    }

    /**
     * Delete the item from the database
     */
    public delete(): void {
        logDebug('item.delete', this.getId())
        const store = useRecipeStore()
        store.deleteItem(this)
    }

    /**
     * Narrow the item to an item
     * @param item
     */
    public narrow(item: Item): Item {
        return new Item(item)
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
    servingAmount: number;
    unit: string;

    constructor(item?: Item) {
        super(item)
        this.amount = 1
        this.servingAmount = 1
        this.unit = 'pcs'
    }

    /**
     * Initialize an stepItem from a json object
     * This is done because the json object does not have the methods of the class
     *
     * @param json
     * @returns a new step item
     */
    public static fromJSON(json: StepItem): StepItem {
        const stepItem = new StepItem()
        stepItem.amount = json.amount
        stepItem.servingAmount = json.amount
        stepItem.unit = json.unit
        const store = useRecipeStore()
        const item = store.getItemsAsMap[json._id ?? '']
        if (typeof item !== 'undefined') {
            stepItem._id = item._id
            stepItem.name = item.name
            stepItem.type = item.type
            stepItem.imgUrl = item.imgUrl
        } else {
            stepItem.name = json.name
            stepItem.type = json.type
        }
        return stepItem
    }

    /**
     * Update the item in the step
     * @param item
     */
    updateItem(item: Item): void {
        this._id = item._id
        this.name = item.name
        this.type = item.type
        this.imgUrl = item.imgUrl
    }
}

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
    temperature?: number;

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
     * @returns a new step
     */
    public static fromJSON(json: Step): Step {
        const item = new Step()
        item.items = json.items?.map(item => StepItem.fromJSON(item)) ?? []
        item.imgUrl = json.imgUrl
        item.description = json.description
        item.duration = Step.parseDuration(json.duration, item.description)
        item.temperature = Step.parseTemperature(json.temperature, item.description)
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
     * Get duration
     */
    public static parseDuration(duration?: number, description?: string): number {
        let dur
        if (duration && duration > 0) {
            dur = duration
        } else {
            const duration = RegExp(/(\d+) (min|minutes|hour|hours)/).exec(description ?? '')
            if (duration === null) {
                dur = 0
            } else {
                let factor = 1
                if (duration[2] === 'hour' || duration[2] === 'hours') {
                    factor = 60
                }
                dur = parseInt(duration[1]) * factor
            }
        }
        return dur
    }

    public static parseTemperature(temperature?: number, description?: string): number {
        let temp
        if (temperature && temperature > 0) {
            temp = temperature
        } else {
            const temperature = RegExp(/(\d+)°([CF]?)/).exec(description ?? '')
            console.log(temperature)
            const unit = temperature?.[2] ?? 'C'
            let unitFactor = 1
            if (unit === 'F') {
                unitFactor = 1.8
            }
            temp = parseInt(temperature?.[1] ?? '0') * unitFactor
        }
        return temp
    }

    /**
     * Get the description of the step
     * as HTML with highlighted items
     * @param className the class name of the highlighted items
     */
    public getDescription(className: string): string {
        let description = this.description
        this.getItems().forEach(item => {
            description = description.replace(new RegExp(item.name, 'ig'), `<span class="${className}">${item.name}</span>`)
        })
        return description
    }

    /**
     * Get all unique items in the step
     * @returns a list of all items in the step
     */
    public getItems(): StepItem[] {
        return [...new Set(this.items)]
    }

    /**
     * Update the servings of the step
     * @param servings
     * @returns the step to allow chaining
     */
    public updateServings(servings = 1): this {
        this.items.forEach(item => {
            item.servingAmount = item.amount * servings
        })
        return this
    }
}

/**
 * Recipe
 * It is a recipe with a list of steps
 * It contains all the information about a recipe
 */
export class Recipe {
    _id?: string;
    _tmpId?: string;
    name: string;
    authors: string[];
    description: string;
    steps: Step[];
    items: StepItem[];
    itemsById: { [key: string]: StepItem };
    props: {
        url?: string;
        imgUrl?: string;
        duration?: number;
        createdAt: Date;
        tags?: string[];
    };
    source: {
        url?: string;
        authors: {
            name: string;
            url?: string;
        }[];
    };
    servings: number;
    isLiked: boolean;

    constructor() {
        // create a temporary id to identify the recipe in the store before it is saved
        this._tmpId = `tmp${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`
        this.name = 'New Recipe'
        this.authors = []
        this.description = ''
        this.props = {
            url: '',
            imgUrl: '',
            duration: 0,
            createdAt: new Date(),
            tags: [],
        }
        this.steps = [new Step()]
        this.items = []
        this.itemsById = {}
        this.servings = 1
        this.isLiked = false;
        this.source = {
            url: '',
            authors: [],
        }
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

        // Id
        recipe._id = json._id
        delete recipe._tmpId
        // if the id is undefined, throw an error
        if (recipe._id === undefined) {
            throw new Error("recipe id is undefined")
        }

        recipe.name = json.name
        recipe.authors = json.authors ?? []
        recipe.description = json.description
        recipe.steps = json.steps?.map(step => Step.fromJSON(step)) ?? [new Step()]

        // Props
        recipe.props.url = json.props.url
        recipe.props.imgUrl = json.props.imgUrl
        recipe.props.tags = json.props.tags
        recipe.props.duration = json.props.duration
        recipe.props.createdAt = new Date(json.props.createdAt)

        // Source
        recipe.source.url = json.props.url
        recipe.source.authors = json.authors.map((author: string) => ({
            name: author,
            url: ''
        }))

        recipe.computeItems()
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
     * Get the authors as a string
     * @returns the list of authors as string
     */
    public getAuthors(): string {
        switch ((this.source.authors ?? []).length) {
            case 0:
                return ''
            case 1:
                return this.source.authors[0].name
            case 2:
                return this.source.authors[0].name + ' and ' + this.source.authors[1].name
            default:
                return this.source.authors.map((author) => author.name)
                    .slice(0, length - 1).join(', ') + ' and ' + this.source.authors[length - 1].name
        }
    }

    /**
     * Add an author to the list of authors
     * @param author
     */
    public addAuthor(author: string): void {
        if (this.source.authors === undefined) {
            this.source.authors = []
        }
        this.source.authors.push({name: author})
    }

    /**
     * Get the duration of the recipe. It is the sum of the duration of all steps.
     * @returns the duration of the recipe
     */
    public getDuration(): number {
        return this.steps.reduce((acc, step) => acc + (step.duration ?? 0), 0)
    }

    /**
     * Get the short description of the recipe. It is the first two sentences of the description.
     * @returns the short description of the recipe
     */
    public getShortDescription(): string {
        let shortDescription = this.description.split('.').slice(0, 2).join('.')
        const lastChar = shortDescription.charAt(shortDescription.length - 1)
        if (lastChar !== '.' && lastChar !== '?' && lastChar !== '!') {
            shortDescription += '.'
        }
        return shortDescription
    }

    public getTags(): string[] {
        return this.props.tags ?? []
    }

    /**
     * Updates the recipe in the store
     * @returns the recipe to allow chaining
     */
    public update(): this {
        logDebug('recipe.update', this.getId())
        const store = useRecipeStore()
        store.setRecipes(this)
        return this
    }

    /**
     * Save the recipe to the database
     * @returns the id of the recipe
     */
    public save() {
        logDebug('recipe.save', this.getId())
        const store = useRecipeStore()
        return store.saveRecipes([this])
    }

    /**
     * Delete the recipe from the database
     */
    public delete() {
        const store = useRecipeStore()
        logDebug('delete', this.getId())
        return store.deleteRecipe(this)
    }

    /**
     * Add a step to the recipe
     * @param step
     * @param stepIndex
     * @returns the recipe to allow chaining
     */
    public addStep(step?: Step, stepIndex?: number): this {
        const _step: Step = step ?? new Step()

        if (stepIndex !== undefined) {
            // insert the step at the given index
            this.steps.splice(stepIndex + 1, 0, _step)
        } else {
            // add the step to the end
            this.steps.push(_step)
        }
        this.computeItems()
        return this
    }

    /**
     * Remove a step from the recipe
     * @param index
     * @returns the recipe to allow chaining
     */
    public removeStep(index: number): this {
        this.steps.splice(index, 1)
        this.computeItems()
        return this
    }

    /**
     * Add an item to a step
     * @param stepIndex index of the step
     * @param itemIndex index of the item
     * @param item the item to add
     * @returns the recipe and the item
     */
    public addItem(stepIndex?: number, itemIndex?: number, item?: Item): { item: Item, recipe: Recipe } {
        item = item ?? new Item();
        logDebug(`add item to recipe ${this.getId()} at step ${stepIndex} and item position ${itemIndex}:`, item)
        const stepItem = new StepItem(item);

        if (stepIndex === undefined) {
            // add a new step if no step is specified
            this.steps[this.steps.length - 1].items.push(stepItem);
        } else if (itemIndex === undefined) {
            // add a new item to the step if no item is specified
            this.steps[stepIndex].items.push(stepItem);
        } else {
            // update the item at the specified index
            this.steps[stepIndex].items[itemIndex] = stepItem;
        }
        this.computeItems()
        return {item, recipe: this};
    }

    computeItems() {
        // Iterate over all steps and all items to compute the list of items
        this.itemsById = {}
        this.steps.forEach(step => step.getItems().forEach((item: StepItem) => {
            this.itemsById[item.getId()] = item
        }))
        this.items = Object.values(this.itemsById)
    }

    /**
     * Get all unique items in the recipe
     * @returns a list of all items in the recipe
     */
    public getStepItems(): StepItem[] {
        return this.items ?? []
    }

    public getItems(): Item[] {
        return this.getStepItems().map(stepItem => stepItem.narrow(stepItem))
    }

    public hasItem(id?: string): boolean {
        return typeof id !== 'undefined' && typeof this.itemsById[id] !== 'undefined'
    }

    /**
     * Add a tag to the recipe
     * @param tag
     * @returns the recipe to allow chaining
     */
    public addTag(tag: string): this {
        if (this.props.tags === undefined) {
            // initialize the tags array if it is undefined
            this.props.tags = []
        }
        this.props.tags.push(tag)
        return this
    }

    /**
     * Share the recipe with buddies
     * This will open the share dialog of the device
     * @returns a promise that resolves when the share dialog is closed
     */
    public async share() {
        return Share.canShare().then((canShare: CanShareResult) => {
            if (!canShare.value) {
                return
            }

            try {
                return Share.share({
                    title: 'Share with your recipe with buddies',
                    text: `Check out this recipe for ${this.name} on Taste Buddy!`,
                    url: '#' + this.getRoute(),
                    dialogTitle: 'Share with buddies',
                })
            } catch (e) {
                logError('sharing failed', e)
            }
        }).catch((error: Error) => {
            logError('sharing failed', error)
        })
    }

    /**
     * Get the route to the recipe
     */
    public getRoute(): string {
        return '/recipe/show/' + this.getId()
    }

    /**
     * Navigate to the recipe
     */
    public route(): void {
        const router = useIonRouter()
        router.push(this.getRoute())
    }

    /**
     * Update the servings of the recipe
     * @param servings
     */
    public updateServings(servings: number) {
        this.servings = servings
        this.steps.forEach(step => {
            step.updateServings(servings)
        })
    }

    /**
     * Like or unlike the recipe
     */
    public toggleLike() {
        const store = useRecipeStore()
        this.isLiked = !this.isLiked
        store.setLike(this)
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