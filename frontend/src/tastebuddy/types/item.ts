import {getLocaleStr, LocaleStr, newLocaleStr, setLocaleStr} from "@/locales/i18n.ts";
import {distance} from "fastest-levenshtein";
import {logDebug, logError, tmpId} from "@/tastebuddy";
import {useRecipeStore} from "@/storage";

export enum ItemTypes {
    Ingredient = 'ingredient',
    Tool = 'tool'
}

/**
 * Item of a recipe
 * It can be an ingredient or a tool
 */
export class Item {
    id?: string;
    tmpId?: string;
    name: LocaleStr;
    type: ItemTypes;
    imgUrl: string;

    constructor(item?: Item) {
        // create a temporary id to identify the item in the store before it is saved
        this.id = item?.id
        this.tmpId = item?.tmpId
        if (this.id === undefined) {
            this.tmpId = item?.tmpId ?? tmpId()
        } else {
            delete this.tmpId
        }
        this.name = item?.name ?? newLocaleStr('New Item', 'en')
        this.type = item?.type ?? ItemTypes.Ingredient
        this.imgUrl = item?.imgUrl ?? ''
    }

    /**
     * Initialize an item from a json object
     * This is done because the json object does not have the methods of the class
     *
     * @param json
     * @returns a new item
     */
    public static fromJSON(json: any): Item {
        const item = new Item()
        item.id = json.id
        // remove the temporary id
        delete item.tmpId
        item.name = json.name
        item.type = json.type
        item.imgUrl = json.imgUrl ?? ''

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
        item.setName(name ?? 'New Item')
        return item
    }

    /**
     * Get the localized name of the item
     * @param lang
     */
    public getName(lang?: string): string {
        return getLocaleStr(this.name, lang)
    }

    /**
     * Checks if the item has the name
     * @param name
     */
    public hasName(name: string): boolean {
        name = name.toLowerCase()
        return Object.values(this.name).some((itemName: string) => {
            itemName = itemName.toLowerCase()
            return distance(itemName, name) < 2 || itemName.includes(name)
        })
    }

    /**
     * Set the localized name of the item
     * @param name
     * @param lang
     */
    public setName(name: string, lang?: string): void {
        setLocaleStr(this.name, name, lang)
    }

    /**
     * Get the id of the item
     * @returns the id of the item
     * @throws an error if the id is undefined
     */
    public getId(): string {
        // if the id is undefined, throw an error
        if (this.id === undefined && this.tmpId === undefined) {
            logError("item id is undefined", this)
            throw new Error("item.id is undefined: " + JSON.stringify(this))
        }
        return this.id ?? this.tmpId as string
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
    public save() {
        logDebug("item.save", this.getId())
        const store = useRecipeStore()
        store.saveItems([this])
    }

    /**
     * Delete the item from the database
     */
    public delete() {
        logDebug('item.delete', this.getId())
        const store = useRecipeStore()
        store.deleteItems(this)
    }

    /**
     * Narrow the item to an item
     * @param item
     */
    public narrow(item: Item): Item {
        return new Item(item)
    }

    /**
     * Get price of the item
     */
    public getPrice(): number {
        return Math.random()
    }
}


/**
 * StepItem of a recipe
 * It is an item with a quantity and a unit
 * It is used in a step
 * This is done to make the item reusable
 */
export class StepItem extends Item {
    quantity: number;
    servings: number;
    unit: string;

    constructor(item?: Item) {
        super(item)
        this.quantity = 1
        this.servings = 1
        this.unit = 'pcs'
    }

    /**
     * Initialize an stepItem from a json object
     * This is done because the json object does not have the methods of the class
     *
     * @param json
     * @returns a new step item
     */
    public static fromJSON(json: any): StepItem {
        const stepItem = new StepItem()
        stepItem.quantity = !json.quantity || json.quantity === 0 ? 1 : json.quantity
        stepItem.unit = json.unit ?? 'pcs'

        const store = useRecipeStore()
        const item = store.getItemsAsMap[json.id ?? ''] ?? Item.newItemFromName('Not found')
        stepItem.updateItem(item)

        return stepItem
    }

    /**
     * Update the item in the step
     * @param item
     */
    updateItem(item: Item): void {
        this.id = item.id
        this.name = item.name
        this.type = item.type
        this.imgUrl = item.imgUrl
    }

    /**
     * Set the quantity of the item
     */
    public setQuantity(quantity: number): void {
        this.quantity = quantity
    }

    /**
     * Set the unit of the item
     */
    public setUnit(unit: string): void {
        this.unit = unit
    }
}