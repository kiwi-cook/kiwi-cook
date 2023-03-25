/**
 * Create a deep copy of an object
 * This is done by serializing the object to JSON and then parsing it back to an object
 * It does not copy functions
 * @param obj 
 * @returns the deep copy of the object
 */
export function deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Format a date to DD.MM.YYYY, e.g. 1.1.2020
 * @param date 
 * @returns the formatted date
 */
export function formatDate(date: Date): string {
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
}