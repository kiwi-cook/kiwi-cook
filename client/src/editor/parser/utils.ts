import {useRecipeStore} from '@/editor/storage';
import {Item, StepItem} from '@/shared/ts';
import {closest, distance} from 'fastest-levenshtein';

/**
 * Parses a string into a list of step items.
 * @param text
 */
export function extractStepItemsFromText(text: string): StepItem[] {
    const recipeStore = useRecipeStore()
    const items = recipeStore.getItemsAsList
    const itemsFromDescription: Set<StepItem> = new Set()
    items.forEach((item: Item) => {
        const itemName = item.getName().toLowerCase()
        if (itemName !== '' && text.toLowerCase().includes(itemName)) {
            itemsFromDescription.add(new StepItem(item))
        }
    })
    return [...itemsFromDescription]
}

/**
 * Extracts the duration from a text in minutes.
 * @param text
 */
export function extractDurationFromText(text: string): number {
    let dur = 0
    const durationRegex = RegExp(/\b(\d+)\s*((min(?:ute)?s?)|(h(?:ou)?rs?))\b/, 'gi')

    // Find all durations in the text and sum them up
    const durations = text.matchAll(durationRegex)
    for (const duration of durations) {
        let factor = 1
        // only check the first character of the duration unit
        if (duration[2].startsWith('h')) {
            factor = 60
        }
        dur += parseInt(duration[1]) * factor
    }


    return dur
}

export function findMostSimilarItems(stepItemsFromRecipe: StepItem[]): StepItem[] {
    const recipeStore = useRecipeStore()
    const items = recipeStore.getItemsAsList
    const itemsNames = items.map((item: Item) => item.getName())
    const maxDistance = 2
    stepItemsFromRecipe.forEach((stepItem: StepItem, index: number) => {
        const closestItemName = closest(stepItem.getName(), itemsNames)
        if (distance(stepItem.getName(), closestItemName) <= maxDistance) {
            const closestItem = items.find((item: Item) => item.getName() === closestItemName)
            stepItemsFromRecipe[index].id = closestItem?.id ?? ''
            stepItemsFromRecipe[index].setName(closestItemName)
        }
    })

    return stepItemsFromRecipe
}

/**
 * Finds the most similar item in the list of items
 * @param itemName
 */
export function findMostSimilarItem(itemName: string): Item | undefined {
    // Prepare store
    const recipeStore = useRecipeStore()
    const items = recipeStore.getItemsAsList
    const itemNames = recipeStore.getItemNamesAsList

    // Get the closest item name from list
    const closestItemName = closest(itemName, itemNames)
    const computedDistance = distance(closestItemName, itemName)
    if (computedDistance > 2) {
        return undefined
    }
    return items.find((item: Item) => item.getName() === closestItemName)
}