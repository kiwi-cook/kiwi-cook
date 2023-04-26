import {toastController} from '@ionic/vue';
import {API_ROUTE, API_ROUTES, API_URL} from './constants';
import {Discount, Item, Market, Recipe} from './types';

type APIResponseBody = Recipe[] | Item[] | Discount[] | Market[] | string

/**
 * This is a response from the API
 */
export interface APIResponse<T extends APIResponseBody> {
    error: boolean
    response: T
}


/**
 * Present a toast to the user
 * @param message the message to display
 * @param duration the duration of the toast in milliseconds
 */
export const presentToast = async (message: string, duration = 1500) => {
    const toast = toastController.create({
        message,
        duration,
        position: 'top'
    });
    await (await toast).present()
}


/**
 * Get different data from the API by providing the API_ROUTE
 *
 * @param route enum value of API_ROUTE
 * @param options optional options object
 * @return the generic type
 *
 * @example
 * sendToAPI<Recipe[]>(API_ROUTE.GET_RECIPES)
 * .then((apiResponse: APIResponse<Recipe[]>) => {
 *    if (!apiResponse.error) {
 *       // do something with the recipes
 *   }
 * })
 */
export function sendToAPI<R extends APIResponseBody>(route: API_ROUTE, options?: {
    formatObject?: { [key: string]: string | number },
    body?: unknown,
    headers?: { key: string, value: string }[],
    errorMessage?: string
}): Promise<APIResponse<R>> {
    let url = API_URL + API_ROUTES[route].url;
    // replace placeholders in url, e.g. CITY
    // please check the keys that can be replaced in constants.ts
    if (options?.formatObject) {
        // use Object.keys to get all keys of the formatObject
        for (const key of Object.keys(options?.formatObject)) {
            url = url.replace(key, options?.formatObject[key].toString());
        }
    }

    // headers
    const headers = new Headers();
    if (options?.body) {
        headers.append('Content-Type', API_ROUTES[route].contentType ?? 'application/json');
    }
    if (options?.headers) {
        for (const header of options.headers) {
            headers.append(header.key, header.value);
        }
    }
    headers.append('Host', window.location.host)

    const fetchOptions: RequestInit = {
        method: API_ROUTES[route].method ?? 'GET',
        headers: headers,
        credentials: 'include'
    }

    if (options?.body) {
        fetchOptions.body = JSON.stringify(options.body)
    }

    // call fetch
    return fetch(url, fetchOptions)
        .then(async (response: Response) => {
            // set cookie if it is in the response
            if (response.headers.has('set-cookie')) {
                const cookie = response.headers.get('set-cookie')
                if (cookie) {
                    document.cookie = cookie
                }
            }

            // return a promise that resolves to the response
            return response.json().then((json: APIResponse<R>) => {
                return json
            })
        })
        .catch(error => {
            // log the error
            console.error(error)

            // present a toast to the user
            if (typeof options?.errorMessage !== 'undefined') {
                presentToast(options?.errorMessage, 5000)
            }
            return {
                error: true,
                response: (options?.errorMessage ?? 'An error occurred') as R
            }
        })
}
