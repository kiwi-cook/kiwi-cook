import {Item, logDebug} from "@/shared/ts";
import {useRecipeStore} from "@/editor/storage";

export class MutableItem extends Item {

    /**
     * Update the item in the store
     * @returns the item to allow chaining
     */
    public update(): this {
        logDebug("MutableItem.update", this.getId())
        const store = useRecipeStore()
        store.setItem(this)
        return this
    }

    /**
     * Save the item to the database
     * @returns the item to allow chaining
     */
    public save() {
        logDebug("MutableItem.save", this.getId())
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
export function newItemFromName(name?: string): MutableItem {
    const item = new MutableItem()
    item.setName(name)
    return item
}