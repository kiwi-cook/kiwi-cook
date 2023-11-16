/*
 * Copyright (c) 2023 Josef Müller.
 */

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
        'teaspoon': 'tsp',
        'tablespoon': 'tbsp',
        'fluid ounce': 'fl oz',
        'cup': 'cup',
        'piece': 'pcs',
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
        'tsp': {
            'factor': 1 / 3,
            'unit': 'tbsp',
        },
        'tbsp': {
            'factor': 3,
            'unit': 'tsp',
        },
        'l': {
            'factor': 1000,
            'unit': 'ml',
        },
        'kg': {
            'factor': 1000,
            'unit': 'g',
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