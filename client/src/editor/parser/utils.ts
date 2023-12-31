/*
 * Copyright (c) 2023 Josef Müller.
 */

import { useRecipeEditorStore } from '@/editor/storage';
import { Item } from '@/shared';
import { closest, distance } from 'fastest-levenshtein';
import { logDebug } from '@/shared/utils/logging.ts';

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

/**
 * Finds the most similar item in the list of items
 * @param itemName
 */
export function findMostSimilarItem(itemName?: string): Item | undefined {
    // Check if the item name is empty
    if (!itemName || itemName === '') {
        return undefined
    }

    // Prepare store
    const recipeStore = useRecipeEditorStore()
    const items = recipeStore.getItemsAsList
    const itemNames = recipeStore.getItemNamesAsList

    // Get the closest item name from list
    const closestItemName = closest(itemName, itemNames)
    const computedDistance = distance(closestItemName, itemName)
    logDebug('findMostSimilarItem', `compare ${itemName} with ${closestItemName} (distance: ${computedDistance})`)
    if (computedDistance > 2) {
        return undefined
    }
    return items.find((item: Item) => item.hasName(closestItemName))
}