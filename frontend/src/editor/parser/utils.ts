import {useRecipeStore} from "@/editor/storage";
import {Item, StepItem} from "@/shared";
import {closest, distance} from "fastest-levenshtein";

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

/**
 * Extract temperature from text and convert it to Celsius
 *
 * @param temperature
 * @param description
 */
export const parseTemperature = (temperature?: number, description?: string): number => {
    let temp
    if (temperature && temperature > 0) {
        temp = temperature
    } else {
        const temperature = RegExp(/(\d+)°([CF]?)/).exec(description ?? '')
        const unit = temperature?.[2] ?? 'C'
        let conversionFormula: (a: number) => number = (a) => a
        if (unit === 'F') {
            conversionFormula = (a) => (a - 32) / 1.8
        }
        temp = conversionFormula(parseInt(temperature?.[1] ?? '0'))
    }
    return temp
}

/**
 * Parses a string quantity into a number.
 * @param quantity
 */
export function parseQuantity(quantity: string): number {
    const fractionalMap: { [fraction: string]: number } = {
        '½': 0.5,
        '⅓': 1 / 3,
        '¼': 0.25,
        '⅕': 0.2,
        '⅙': 1 / 6,
        '⅛': 0.125,
        '⅔': 2 / 3,
        '¾': 0.75,
        '⅖': 0.4,
        '⅜': 0.375,
        '⅗': 0.6,
        '⅝': 0.625,
        '⅞': 0.875,
    };

    const normalizedQuantity: string = quantity.trim();

    if (normalizedQuantity in fractionalMap) {
        return fractionalMap[normalizedQuantity];
    }

    const parsedFloat = parseFloat(normalizedQuantity);
    if (!isNaN(parsedFloat)) {
        return parsedFloat;
    }

    return 0;
}

/**
 * Parses a string unit into a normalized unit.
 * @param unit
 * @param defaultUnit
 */
export function normalizeUnit(unit?: string, defaultUnit = 'pcs'): string {
    // If unit is not defined, return default unit
    if (!unit) {
        return defaultUnit
    }

    const unitMap: { [unit: string]: string } = {
        "teaspoon": "tsp",
        "tablespoon": "tbsp",
        "fluid ounce": "fl oz",
        "cup": "cup",
        "piece": "pcs",
    };

    // Format unit
    unit = unit.toLowerCase()
    if (unit.endsWith('s')) {
        unit = unit.slice(0, unit.length - 1)
    }

    // Return normalized unit
    return unitMap[unit] || unit || defaultUnit;
}

/**
 * Parses a string unit into a normalized unit.
 * @param value
 * @param normalizedUnit
 */
export function convertUnits(value: number, normalizedUnit: string): { value: number, unit: string } {
    const unitConversion: { [fromUnit: string]: { factor: number, unit: string } } = {
        "tsp": {
            "factor": 1 / 3,
            "unit": "tbsp",
        },
        "tbsp": {
            "factor": 3,
            "unit": "tsp",
        },
        "l": {
            "factor": 1000,
            "unit": "ml",
        },
        "kg": {
            "factor": 1000,
            "unit": "g",
        }
    };

    const conversionResult: { value: number, unit: string } = {
        value: value,
        unit: normalizedUnit,
    }

    // Convert unit if possible
    const toUnit = unitConversion[normalizedUnit]
    if (toUnit) {
        conversionResult.value = toUnit.factor * value
        conversionResult.unit = toUnit.unit
    }

    return conversionResult
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
 * @param maxDistance
 */
export function findMostSimilarItem(itemName: string, maxDistance = 2): Item | undefined {
    // Prepare store
    const recipeStore = useRecipeStore()
    const items = recipeStore.getItemsAsList
    const itemNames = recipeStore.getItemNamesAsList

    // Get the closest item name from list
    const closestItemName = closest(itemName, itemNames)
    const computedDistance = distance(closestItemName, itemName)
    if (computedDistance > maxDistance) {
        return undefined
    }
    return items.find((item: Item) => item.getName() === closestItemName)
}