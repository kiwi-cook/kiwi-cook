import { API_ROUTE, API_ROUTES, API_URL } from './constants';
import { Recipe, Discount, Market, Item } from './types';

/**
 * Get different data from the API by providing the API_ROUTE and a callback function
 * that takes a list of e.g., Recipe or Item objects as parameter.
 * @param route enum value of API_ROUTE
 * @param callback function that takes a list of e.g., Recipe or Item objects as parameter
 */
export function getFromAPI<T extends Recipe[] | Item[] | Discount[] | Market[]>(route: API_ROUTE, callback: (json: T) => void, formatObject?: { [key: string]: string | number }): void {
    let url = API_URL + API_ROUTES[route].url;
    // replace placeholders in url, e.g. CITY
    // please check the keys that can be replaced in constants.ts
    if (formatObject) {
        for (const key in formatObject) {
            url = url.replace(key, formatObject[key].toString());
        }
    }

    // call fetch
    fetch(url, { method: API_ROUTES[route].method ?? 'GET' })
        .then(response => response.json())
        .then(data => {
            console.debug(data)
            callback(data)
        })
        .catch(error => {
            console.error(error)
        })
}