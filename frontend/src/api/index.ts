import { API_ROUTE, getApiRoute } from './constants';
import { Recipe, Discount, Market, Item } from './types';

/**
 * Get different data from the API by providing the API_ROUTE and a callback function
 * that takes a list of e.g., Recipe or Item objects as parameter.
 * @param route enum value of API_ROUTE
 * @param callback function that takes a list of e.g., Recipe or Item objects as parameter
 */
export function getFromAPI<T extends Recipe[] | Item[] | Discount[] | Market[]>(route: API_ROUTE, callback: (json: T) => void): void {
    // call fetch
    fetch(getApiRoute(route))
        .then(response => response.json())
        .then(data => {
            console.debug(data)
            callback(data)
        })
        .catch(error => {
            console.error(error)
        })
}