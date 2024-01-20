/*
 * Copyright (c) 2023-2024 Josef Müller.
 */

import { getLocaleStr, LocaleStr, newLocaleStr } from '@/shared/locales/i18n';
import { distance } from 'fastest-levenshtein';
import { tmpId } from '@/shared';
import { logError, logWarn } from '@/shared/utils/logging.ts';
import { useSharedRecipeStore } from '@/shared/storage';
import { ERROR_MSG } from '@/shared/utils/errors.ts';

export enum ItemType {
    Ingredient = 'ingredient', Tool = 'tool'
}

const MODULE = 'shared.types.item.'

/**
 * Item of a recipe
 * It can be an ingredient or a tool
 */
export class Item {
    id: string;
    name: LocaleStr;
    type: ItemType;
    imgUrl: string;
    isTmp: boolean;

    constructor(item?: Item) {
        // create a temporary id to identify the item in the store before it is saved
        this.id = item?.id ?? tmpId()
        this.isTmp = item?.id === undefined;
        this.name = item?.name ?? newLocaleStr()
        this.type = item?.type ?? ItemType.Ingredient
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
        if (item?.id === undefined) {
            logWarn(MODULE + Item.fromJSON.name, ERROR_MSG.noId)
            item.isTmp = true
        }
        item.name = json.name
        item.type = json.type
        item.imgUrl = json.imgUrl ?? ''
        return item
    }

    /**
     * Update the item in the step
     * @param item
     */
    updateItem(item: Item): this {
        this.id = item.id
        if (item?.id === undefined) {
            logWarn(MODULE + this.updateItem.name, ERROR_MSG.noId)
            this.isTmp = true
        }

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
 * RecipeItem of a recipe
 * It is an item with a quantity and a unit
 * It is used in a step
 * This is done to make the item reusable
 */
export class RecipeItem extends Item {
    quantity: number;
    servings: number;
    unit: string;

    constructor(recipeItem?: RecipeItem) {
        super(recipeItem)
        if (this.id === undefined) {
            logError(MODULE + 'RecipeItem.new', ERROR_MSG.noId)
            throw new Error(ERROR_MSG.noId)
        }
        this.quantity = recipeItem?.quantity ?? 1
        this.servings = 1
        this.unit = recipeItem?.unit ?? ''
    }

    /**
     * Initialize a recipe item from a json object
     * This is done because the RecipeItem only contains the id of the item
     *
     * @returns a RecipeItem created from its id
     * @param json the json object
     */
    static fromJSON(json: any): RecipeItem {
        const fName = MODULE + 'RecipeItem.fromJSON'

        const sharedRecipeStore = useSharedRecipeStore()
        const itemsAsMap = sharedRecipeStore.getItemsAsMap
        /* Check if map is empty */
        if (Object.keys(itemsAsMap).length === 0) {
            logWarn(fName, 'itemsAsMap is empty', json)
        }

        /* Get item from map */
        let item = itemsAsMap[json.id]
        if (item === undefined) {
            logWarn(fName, ERROR_MSG.isUndefined, json)
            logWarn(fName, 'please reset cache')
        }
        item = item ?? new Item()

        const recipeItem = new RecipeItem()
        recipeItem.updateItem(item)
        recipeItem.quantity = !json.quantity || json.quantity === 0 ? 1 : json.quantity
        recipeItem.unit = json.unit ?? ''
        return recipeItem
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