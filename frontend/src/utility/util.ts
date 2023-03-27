/**
 * Create a deep copy of an object
 * This is done by serializing the object to JSON and then parsing it back to an object
 * It does not copy functions
 * @param obj 
 * @returns the deep copy of the object
 */
export function deepCopy<T>(obj?: T): T {
    return JSON.parse(JSON.stringify(obj ?? "{}"));
}

/**
 * Format a date to DD.MM.YYYY, e.g. 1.1.2020
 * @param date 
 * @returns the formatted date
 */
export function formatDate(date?: Date): string {
    if (!date) {
        return '';
    }
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
}

/**
 * Generate hash from string
 * @param str the string to hash
 * @returns the hash
*/
export function hash(str: string): string {
    let hash = 0, i, chr;
    if (str.length === 0) {
        return "0";
    }
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash.toString();
}

export type SchemaType = {
    type: string,
    path: string
    children?: SchemaType[]
}

/**
 * Generate the recipe schema
 * @param data The recipe data
 * @param {string} [parentPath=''] The name of root. By default, it is empty.
 */
export const generateSchema = (data: any, parentPath = ''): SchemaType => {
    if (Array.isArray(data)) {
        // always use the first element to generate the schema
        return Object.assign({type: 'array'}, generateSchema(data[0], parentPath))
    }

    const schema: SchemaType = {
        path: parentPath,
        type: typeof data
    }
    if (typeof data === 'object' && typeof data !== 'undefined') {
        schema.children = []
        Object.entries(data).forEach(([key, value]) => {
            schema.children?.push(generateSchema(value, `${parentPath}.${key}`))
        })
    }
    return schema
}