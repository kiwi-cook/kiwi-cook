/*
 * Copyright (c) 2023-2024 Josef Müller.
 */

import { distance } from 'fastest-levenshtein';
import { MultiLanguageField, tmpId } from '@/shared';
import { logWarn } from '@/shared/utils/logging.ts';
import { ERROR_MSG } from '@/shared/utils/errors.ts';

export enum IngredientType {
    Ingredient = 'ingredient', Tool = 'tool'
}

const MODULE = 'shared.types.item.'

/**
 * Item of a recipe
 * It can be an ingredient or a tool
 */
export class Ingredient {
    id: string;
    name: MultiLanguageField;
    type: IngredientType;
    imgUrl: string;
    isTmp: boolean;

    constructor(item?: Partial<Ingredient>) {
        // create a temporary id to identify the item in the store before it is saved
        this.id = item?.id ?? tmpId()
        this.isTmp = item?.id === undefined;
        this.name = item?.name ?? MultiLanguageField.new()
        this.type = item?.type ?? IngredientType.Ingredient
        this.imgUrl = item?.imgUrl ?? ''
    }

    /**
     * Initialize an item from a json object
     * This is done because the json object does not have the methods of the class
     *
     * @param json
     * @returns a new item
     */
    public static fromJSON(json: any): Ingredient {
        const item = new Ingredient()
        item.id = json.id
        if (item?.id === undefined) {
            logWarn(MODULE + Ingredient.fromJSON.name, ERROR_MSG.noId)
            item.isTmp = true
        }
        item.name = MultiLanguageField.fromJSON(json.name) ?? MultiLanguageField.new()
        item.type = json.type ?? IngredientType.Ingredient
        item.imgUrl = json.imgUrl ?? ''
        return item
    }

    static empty() {
        return new Ingredient()
    }

    /**
     * Update the item in the step
     * @param item
     */
    updateItem(item: Ingredient): this {
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
        const locale = this.name.get(lang)
        const [one, many] = locale.split('|')
        if (amount === 1) {
            return one
        }
        return many ?? one
    }

    /**
     * Checks if the item has the name
     * @param name
     */
    public hasName(name: string): boolean {
        const splitName = name.toLowerCase().split(' ');
        const ingredients = this.name.getAll().map(n => n.toLowerCase().split(' '));

        return ingredients.some(ingredientWords =>
            splitName.every(nameWord =>
                ingredientWords.some(ingredientWord =>
                    distance(nameWord, ingredientWord) <= 1 || ingredientWord.match(nameWord) !== null
                )
            )
        );
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
    public narrow(item: Ingredient): Ingredient {
        return new Ingredient(item)
    }

    /**
     * Get price of the item
     */
    public getPrice(): number {
        return Math.random()
    }
}
