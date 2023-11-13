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