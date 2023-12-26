/*
 * Copyright (c) 2023 Josef Müller.
 */

import {Item, RecipeItem, setLocaleStr} from '@/shared';
import {useRecipeEditorStore} from '@/editor/storage';
import {logDebug} from '@/shared/utils/logging';
import {findMostSimilarItem} from '@/editor/parser/utils.ts';

export class MutableItem extends Item {

    /**
     * Get the localized name of the item
     */
    public getRawName(lang: string): string {
        return this.name[lang]
    }

    /**
     * Set the localized name of the item
     * @param name
     * @param lang
     */
    public setName(name?: string, lang?: string): void {
        setLocaleStr(this.name, name ?? '', lang)
    }

    /**
     * Update the item in the store
     * @returns the item to allow chaining
     */
    public update(): this {
        logDebug('MutableItem.update', this.getId())
        const store = useRecipeEditorStore()
        store.setItem(this)
        return this
    }

    /**
     * Save the item to the database
     * @returns the item to allow chaining
     */
    public save() {
        logDebug('MutableItem.save', this.getId())
        const store = useRecipeEditorStore()
        store.saveItems([this])
    }

    /**
     * Delete the item from the database
     */
    public delete() {
        logDebug('MutableItem.delete', this.getId())
        const store = useRecipeEditorStore()
        store.deleteItems(this)
    }
}


/**
 * Add a new item to the store with a given name
 * @param name
 * @returns the item to allow chaining
 */
export function newItemFromName(name?: string): RecipeItem {
    const item = findMostSimilarItem(name)
    const recipeItem = new RecipeItem()
    if (item) {
        recipeItem.id = item.getId()
    }
    return recipeItem
}