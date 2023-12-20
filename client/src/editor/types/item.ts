/*
 * Copyright (c) 2023 Josef Müller.
 */

import {Item, RecipeItem, setLocaleStr} from '@/shared';
import {useRecipeStore} from '@/editor/storage';
import {logDebug} from '@/shared/utils/logging';

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
        const store = useRecipeStore()
        store.setItem(this)
        return this
    }

    /**
     * Save the item to the database
     * @returns the item to allow chaining
     */
    public save() {
        logDebug('MutableItem.save', this.getId())
        const store = useRecipeStore()
        store.saveItems([this])
    }

    /**
     * Delete the item from the database
     */
    public delete() {
        logDebug('MutableItem.delete', this.getId())
        const store = useRecipeStore()
        store.deleteItems(this)
    }
}


/**
 * Add a new item to the store with a given name
 * @param name
 * @returns the item to allow chaining
 */
export function newItemFromName(name?: string): RecipeItem {
    const item = new RecipeItem()
    item.name['en'] = name ?? ''
    return item
}