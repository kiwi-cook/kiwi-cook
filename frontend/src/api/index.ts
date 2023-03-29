import { toastController } from '@ionic/vue';
import { API_ROUTE, API_ROUTES, API_URL } from './constants';
import { Recipe, Discount, Market, Item } from './types';

export type APIResponseBody = Recipe[] | Item[] | Discount[] | Market[]

export type APIResponse = {
    error: boolean
    message?: string
    response?: APIResponseBody
}


/**
 * Present a toast to the user
 * @param message the message to display
 * @param duration the duration of the toast in milliseconds
 */
export const presentToast = async (message: string, duration = 1500) => {
    const toast = toastController.create({
        message: message,
        duration: duration,
        position: 'top'
    });
    await (await toast).present()
}


/**
 * Get different data from the API by providing the API_ROUTE
 * 
 * @param route enum value of API_ROUTE
 * @param options optional options object
 * @return either APIResponseBody on success or false on error
 */
export function getFromAPI<T extends Recipe | Item | Discount | Market>(route: API_ROUTE, options?: { formatObject?: { [key: string]: string | number }, body?: T, errorMessage?: string }): Promise<T[] | false> {
    let url = API_URL + API_ROUTES[route].url;
    // replace placeholders in url, e.g. CITY
    // please check the keys that can be replaced in constants.ts
    if (options?.formatObject) {
        // use Object.keys to get all keys of the formatObject
        for (const key of Object.keys(options?.formatObject)) {
            url = url.replace(key, options?.formatObject[key].toString());
        }
    }

    const fetchOptions: RequestInit = {
        method: API_ROUTES[route].method ?? 'GET',
        headers: { 'Content-Type': 'application/json' },
    }

    if (options?.body) {
        fetchOptions.body = JSON.stringify(options.body)
    }

    // call fetch
    return fetch(url, fetchOptions)
        .then(async (response: Response) => {
            // return a promise that resolves to the response
            return response.json().then((json: APIResponse) => {
                // check if there was an error
                if (json.message) {
                    // present a toast to the user
                    presentToast(json.message, 5000)
                }

                // return the response as an array of the type T
                return (json.response ?? []) as T[]
            })
        })
        .catch(error => {
            // log the error
            console.error(error)

            // present a toast to the user
            if (typeof options?.errorMessage !== 'undefined') {
                presentToast(options?.errorMessage, 5000)
            }
            return false
        })
}
