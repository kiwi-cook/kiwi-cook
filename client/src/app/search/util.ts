/*
 * Copyright (c) 2023 Josef Müller.
 */

/**
 * Calculate the median of an array of numbers
 * @param array
 */
export function median(array: number[]) {
    if (!array.length) {
        return 0;
    }
    const sorted = array.toSorted((a, b) => a - b)
    const mid = Math.floor(array.length / 2);
    return sorted.length % 2 ? sorted[mid] : ((sorted[mid - 1] + sorted[mid]) / 2);
}

/**
 * Calculate the average of an array of numbers
 * @param array
 */
export function average(array: number[]) {
    if (!array.length) {
        return 0;
    }
    return array.reduce((a, b) => a + b) / array.length;
}

/**
 * Calculate the standard deviation of an array of numbers
 * @param array
 */
export function standardDeviation(array: number[]) {
    if (!array.length) {
        return 0;
    }
    const avg = average(array);
    const squareDiffs = array.map((value) => {
        const diff = value - avg;
        return diff * diff;
    });
    const avgSquareDiff = average(squareDiffs);
    return Math.sqrt(avgSquareDiff);
}

/**
 * Mutate a string in all possible ways
 * @param str
 */
export function mutateString(str: string) {
    const normalizedString = str.trim().toLowerCase()
    const splitMutation = normalizedString.split(/[\s,-]/)
    const queuedMutations = [...splitMutation, normalizedString]
    const mutations: Set<string> = new Set<string>(queuedMutations)

    for (const mutation of queuedMutations) {
        for (let i = 0; i < mutation.length; i++) {
            // Swap mutations
            if (i < mutation.length - 1) {
                mutations.add(mutation.slice(0, i) + mutation[i + 1] + mutation[i] + mutation.slice(i + 2))
            }

            // Insert mutations
            mutations.add(mutation.slice(0, i) + ' ' + mutation.slice(i))

            // Delete mutations
            mutations.add(mutation.slice(0, i) + mutation.slice(i + 1))

            // Replace mutations
            mutations.add(mutation.slice(0, i) + ' ' + mutation.slice(i + 1))

            // Double character mutations
            mutations.add(mutation.slice(0, i) + mutation[i] + mutation.slice(i))
        }
    }

    return [...mutations]
}