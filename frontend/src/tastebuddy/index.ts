import {toastController} from '@ionic/vue';
import {API_ROUTE, API_ROUTES, API_URL, DURATIONS} from './constants';
import {Item, Recipe, RecipeSuggestion} from './types';

type APIResponseBody = Recipe[] | Item[] | RecipeSuggestion[] | string

/**
 * This is a response from the API
 */
export interface APIResponse<T extends APIResponseBody> {
    error: boolean
    response: T,
    id?: string
}


/**
 * Present a toast to the user
 * @param message the message to display
 * @param duration the duration of the toast in milliseconds
 */
export const presentToast = async (message: string, isError = false, duration = DURATIONS.SHORT) => {
    const toast = toastController.create({
        message,
        duration,
        position: 'top',
        color: isError ? 'danger' : 'success'
    });
    await (await toast).present()
}

/**
 * Log a message to the console
 * @param functionName the name of the function
 * @param message the message to log
 */
export const log = (functionName: string, message?: any) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[${functionName}]:`, message)
    }
}
/**
 * Debug a message to the console
 * @param functionName the name of the function
 * @param message the message to log
 */
export const logDebug = (functionName: string, message: any) => {
    if (process.env.NODE_ENV === 'development') {
        console.debug(`[${functionName}]:`, message)
    }
}

/**
 * Log an error to the console
 * @param functionName the name of the function that threw the error
 * @param error the error to log
 */
export const logError = (functionName: string, error: any) => {
    if (error instanceof Error) {
        console.error(`[${functionName}]: ${error.message}`)
    } else {
        console.error(`[${functionName}]:`, error)
    }
}

const controller = new AbortController()

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

    const fetchOptions: RequestInit = {
        method: API_ROUTES[route].method ?? 'GET',
        headers: headers,
        credentials: API_ROUTES[route].credentials ?? undefined,
        body: options?.body ? JSON.stringify(options.body) : null,
        signal: controller.signal
    }

    // call fetch
    logDebug('sendToAPI ' + route, fetchOptions)
    return fetch(url, fetchOptions).then(async (response: Response) => {
        // set cookie if it is in the response
        if (response.headers.has('set-cookie')) {
            const cookie = response.headers.get('set-cookie')
            if (cookie) {
                document.cookie = cookie
            }
        }

        return response
    })
        .then((response: Response) => {
            const jsonResponse = response.json()
            logDebug('sendToAPI ' + route, jsonResponse)
            return jsonResponse
        })
        .catch(error => {
            // log the error
            logError('sendToAPI ' + route, error)

            // present a toast to the user
            if (typeof options?.errorMessage !== 'undefined') {
                presentToast(options?.errorMessage, true, DURATIONS.LONG)
            }
            return {
                error: true,
                response: (options?.errorMessage ?? 'An error occurred') as R
            }
        })
}
