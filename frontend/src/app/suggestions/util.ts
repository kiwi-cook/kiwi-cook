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