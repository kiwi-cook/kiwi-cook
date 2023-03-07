import { API_ROUTE, API_ROUTES, API_URL } from './constants';
import { Recipe, Discount, Market, Item } from './types';

/**
 * Get different data from the API by providing the API_ROUTE and a callback function
 * that takes a list of e.g., Recipe or Item objects as parameter.
 * @param route enum value of API_ROUTE
 * @param callback function that takes a list of e.g., Recipe or Item objects as parameter
 */
export function getFromAPI<T extends Recipe | Item | Discount | Market>(route: API_ROUTE, options: { callback?: (json: T[]) => void, formatObject?: { [key: string]: string | number }, body?: T}): void {
    let url = API_URL + API_ROUTES[route].url;
    // replace placeholders in url, e.g. CITY
    // please check the keys that can be replaced in constants.ts
    if (options?.formatObject) {
        for (const key in options?.formatObject) {
            url = url.replace(key, options?.formatObject[key].toString());
        }
    }

    const fetchOptions: RequestInit = {
        method: API_ROUTES[route].method ?? 'GET',
        headers: { 'Content-Type': 'application/json' },
    }

    if (options?.body) {
        fetchOptions.body = JSON.stringify(options?.body)
    }

    // call fetch
    fetch(url, fetchOptions)
        .then(response => response.json())
        .then(data => {
            console.debug(data)
            if (typeof options?.callback !== 'undefined') {
                options?.callback(data)
            }
        })
        .catch(error => {
            console.error(error)
        })
}

