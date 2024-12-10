export function parseIngredient(ingredient: string): {
  name: string
  amount: number | undefined
  unit: string | undefined
} {
  /**
   * Parses an ingredient string into structured data (amount, unit, name).
   * Handles fractions, mixed numbers, and Unicode fractions.
   *
   * Args:
   *   ingredient (string): The ingredient string (e.g., "1 1/2 cups sugar").
   *
   * Returns:
   *   Object: { name, amount, unit }
   */

  // Regular expression to match amounts, units, and names
  const regex = /^([\d./\s⁄½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅐⅛⅜⅝⅞]+)?\s*([a-zA-Z]+)?\s*(.+)$/

  const match = ingredient.match(regex)

  if (!match) {
    // If no match, return the entire string as the name
    return {
      name: ingredient.trim(),
      amount: undefined,
      unit: undefined,
    }
  }

  const [, amountStr, unit, name] = match

  let amount: number | undefined

  // Parse the amount using fractionToFloat
  if (amountStr) {
    try {
      amount = fractionToFloat(amountStr.trim())
    } catch {
      amount = undefined // Fallback if parsing fails
    }
  }

  return {
    name: name?.trim() ?? '',
    amount,
    unit: unit?.trim(),
  }
}

export function fractionToFloat(fraction: string): number {
  /**
   * Convert string representation of a fraction to a float.
   * Supports fractions like "3/4", "1 1/2", and Unicode fractions like "½".
   *
   * Args:
   *   fraction (string): String representation of a fraction.
   *
   * Returns:
   *   number: Converted fraction as a float.
   */

  // Replace Unicode fraction divider (e.g., "1⁄2") with "/"
  let parsedFraction = fraction
  parsedFraction = fraction.replace('⁄', '/')

  try {
    // Handle Unicode fractions (e.g., "½")
    const unicodeValue = parseUnicodeFraction(parsedFraction)
    if (unicodeValue !== null) {
      return unicodeValue
    }
  } catch {
    // Ignore errors and proceed to the next parsing step
  }

  try {
    // Handle normal fractions (e.g., "1/2") or mixed fractions (e.g., "1 1/2")
    const parts = parsedFraction.split(' ')
    if (parts.length === 1) {
      // Simple fraction (e.g., "3/4")
      return evalFraction(parts[0]!)
    }
    if (parts.length === 2) {
      // Mixed fraction (e.g., "1 1/2")
      const wholeNumber = parseFloat(parts[0]!)
      const fractionalPart = evalFraction(parts[1]!)
      return wholeNumber + fractionalPart
    }
  } catch {
    // Ignore errors and throw a final error if parsing fails
  }

  throw new Error(`Invalid fraction format: ${fraction}`)
}

/**
 * Parse Unicode fractions (e.g., "½") into their numeric values.
 */
function parseUnicodeFraction(fraction: string): number | null {
  const unicodeFractions: Record<string, number> = {
    '½': 0.5,
    '⅓': 1 / 3,
    '⅔': 2 / 3,
    '¼': 0.25,
    '¾': 0.75,
    '⅕': 0.2,
    '⅖': 0.4,
    '⅗': 0.6,
    '⅘': 0.8,
    '⅙': 1 / 6,
    '⅚': 5 / 6,
    '⅐': 1 / 7,
    '⅛': 0.125,
    '⅜': 0.375,
    '⅝': 0.625,
    '⅞': 0.875,
  }

  return unicodeFractions[fraction] ?? null
}

/**
 * Evaluate a fraction string (e.g., "3/4") into a float.
 */
function evalFraction(fraction: string): number {
  const [numerator, denominator] = fraction.split('/').map(Number)
  if (!numerator || isNaN(numerator) || !denominator || isNaN(denominator)) {
    throw new Error(`Invalid fraction: ${fraction}`)
  }
  return numerator / denominator
}
