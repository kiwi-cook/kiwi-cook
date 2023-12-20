/*
 * Copyright (c) 2023 Josef Müller.
 */

import {getLocaleStr, LocaleStr, newLocaleStr} from '@/shared/locales/i18n';
import {distance} from 'fastest-levenshtein';
import {tmpId} from '@/shared';
import {useRecipeStore} from '@/app/storage';

export enum ItemType {
    Ingredient = 'ingredient',
    Tool = 'tool'
}

/**
 * Item of a recipe
 * It can be an ingredient or a tool
 */
export class Item {
    id: string;
    name: LocaleStr;
    type: ItemType;
    imgUrl: string;

    constructor(item?: Item) {
        // create a temporary id to identify the item in the store before it is saved
        this.id = item?.id ?? tmpId()
        this.name = item?.name ?? newLocaleStr()
        this.type = item?.type ?? ItemType.Ingredient
        this.imgUrl = item?.imgUrl ?? ''
    }

    /**
     * Update the item in the step
     * @param item
     */
    updateItem(item: Item): this {
        this.id = item.id
        this.name = item.name
        this.type = item.type
        this.imgUrl = item.imgUrl
        return this
    }

    /**
     * Get the localized name of the item
     * @param lang
     * @param amount
     */
    public getName(lang?: string, amount?: number): string {
        const locale = getLocaleStr(this.name, lang)
        const [one, many] = locale.split('|')
        if (amount === 1) {
            return one
        }
        return many ?? one
    }


    /**
     * Get all names of the item
     */
    public getAllNames(): string[] {
        return Object.values(this.name).map((name: string) => name.split('|')).flat()
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
     * Get the id of the item
     * @returns the id of the item
     * @throws an error if the id is undefined
     */
    public getId(): string {
        return this.id ?? ''
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
 * Initialize an item from a json object
 * This is done because the json object does not have the methods of the class
 *
 * @param json
 * @returns a new item
 */
export function itemFromJSON(json: any): Item {
    const item = new Item()
    item.id = json.id
    item.name = json.name
    item.type = json.type
    item.imgUrl = json.imgUrl ?? ''

    return item
}

/**
 * RecipeItem of a recipe
 * It is an item with a quantity and a unit
 * It is used in a step
 * This is done to make the item reusable
 */
export class RecipeItem extends Item {
    quantity: number;
    servings: number;
    unit: string;

    constructor(item?: Item) {
        super(item)
        this.quantity = 1
        this.servings = 1
        this.unit = ''
    }

    public getQuantity(): number {
        return this.quantity * this.servings
    }

    /**
     * Set the quantity of the item
     */
    public setQuantity(quantity: number): this {
        this.quantity = quantity
        return this
    }

    /**
     * Set the unit of the item
     */
    public setUnit(unit: string): this {
        this.unit = unit
        return this
    }

    /**
     * Set the servings of the item
     */
    public setServings(servings: number): this {
        this.servings = servings
        return this
    }
}

/**
 * Initialize a recipeItem from a json object
 * This is done because the json object does not have the methods of the class
 *
 * @param json
 * @returns a new step item
 */
export function recipeItemFromJSON(json: any): RecipeItem {
    const recipeItem = new RecipeItem()
    recipeItem.quantity = !json.quantity || json.quantity === 0 ? 1 : json.quantity
    recipeItem.unit = json.unit ?? 'pcs'

    const store = useRecipeStore()
    const item = store.getItemsAsMap[json.id ?? ''] ?? new Item()
    recipeItem.updateItem(item)

    return recipeItem
}