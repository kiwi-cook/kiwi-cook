import { API_ROUTE, getApiRoute } from './constants';

/**
 * Get different data from the API by providing the API_ROUTE and a callback function
 * that takes a list of e.g., Recipe or Item objects as parameter.
 * @param route enum value of API_ROUTE
 * @param callback function that takes a list of e.g., Recipe or Item objects as parameter
 */
export const getFromAPI = (route: API_ROUTE, callback: (json: Recipe[] | Item[] | Discount[] | Market[]) => {}) => {
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