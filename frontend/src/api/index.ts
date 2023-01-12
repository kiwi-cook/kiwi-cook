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

/**
 * Post different data to the API by providing the API_ROUTE and a list of e.g., Recipe or Item objects.
 * @param route enum value of API_ROUTE
 * @param body 
 */
export function postToAPI<T extends Recipe | Item | Discount | Market>(route: API_ROUTE, body: T): void {
    // call fetch
    fetch(getApiRoute(route), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
}
