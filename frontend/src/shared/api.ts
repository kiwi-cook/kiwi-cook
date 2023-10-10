import {Item, logDebug, logError, presentToast, Recipe, RecipeSuggestion} from "@/shared";

type APIResponseBody = Recipe[] | Item[] | RecipeSuggestion[] | string

// URLs for the API

// Possible URLs for the API
const possibleAPI_URLS = ['https://tastebuddy-1-k6629823.deta.app', 'http://localhost:8081']

export const API_URL = process.env.NODE_ENV === 'development' ? possibleAPI_URLS[1] : possibleAPI_URLS[0]

export enum API_ROUTE {
    POST_AUTH,
    GET_AUTH,
    GET_RECIPES,
    ADD_RECIPES,
    DELETE_RECIPES,
    GET_ITEMS,
    ADD_ITEMS,
    DELETE_ITEMS
}

const JSONTYPE = 'application/json'


type API_ROUTE_OPTIONS = {
    url: string;
    method: string;
    contentType?: 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
    credentials?: 'include' | 'omit' | 'same-origin';
}

export const API_ROUTES: { [key in API_ROUTE]: API_ROUTE_OPTIONS } = {
    [API_ROUTE.POST_AUTH]: {
        url: '/user/auth',
        method: 'POST',
        contentType: 'application/x-www-form-urlencoded',
        credentials: 'include'
    },
    [API_ROUTE.GET_AUTH]: {url: '/user/auth', method: 'GET', contentType: JSONTYPE, credentials: 'include'},
    [API_ROUTE.GET_RECIPES]: {url: '/recipe', method: 'GET', contentType: JSONTYPE},
    [API_ROUTE.ADD_RECIPES]: {url: '/recipe', method: 'POST', contentType: JSONTYPE, credentials: 'include'},
    [API_ROUTE.DELETE_RECIPES]: {
        url: '/recipe',
        method: 'DELETE',
        contentType: JSONTYPE,
        credentials: 'include'
    },
    [API_ROUTE.GET_ITEMS]: {url: '/item', method: 'GET', contentType: JSONTYPE},
    [API_ROUTE.ADD_ITEMS]: {url: '/item', method: 'POST', contentType: JSONTYPE, credentials: 'include'},
    [API_ROUTE.DELETE_ITEMS]: {
        url: '/item',
        method: 'DELETE',
        contentType: JSONTYPE,
        credentials: 'include'
    }
}

export const DURATIONS = {
    SHORT: 3000,
    MEDIUM: 4000,
    LONG: 5000,
}

/**
 * This is the response interface from the API
 */
export interface APIResponse<T extends APIResponseBody> {
    error: boolean
    response: T,
    id?: string
}

// Abort Controller for the fetch function used in sendToAPI
const controller = new AbortController()

/**
 * Options Type for sendToAPI function that is used to
 * communicate with the API of Taste Buddy
 */
export type SendToApiOptions = {
    formatObject?: { [key: string]: string | number },
    body?: unknown,
    headers?: { key: string, value: string }[],
    successMessage?: string,
    errorMessage?: string,
    timeout?: number
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
// eslint-disable-next-line sonarjs/cognitive-complexity
export function sendToAPI<R extends APIResponseBody>(route: API_ROUTE, options?: SendToApiOptions): Promise<APIResponse<R>> {
    let url = API_URL + API_ROUTES[route].url;

    const {formatObject, body, headers, errorMessage, successMessage, timeout} = options ?? {};

    // replace placeholders in url, e.g. CITY
    // please check the keys that can be replaced in constants.ts
    // use Object.keys to get all keys of the formatObject
    for (const key of Object.keys(formatObject ?? {})) {
        if (formatObject) {
            url = url.replace(key, formatObject[key].toString());
        }
    }

    // headers
    const requestHeaders = new Headers();
    if (body) {
        requestHeaders.append('Content-Type', API_ROUTES[route].contentType ?? 'application/json');
    }
    for (const header of headers ?? []) {
        requestHeaders.append(header.key, header.value);
    }

    const fetchOptions: RequestInit = {
        method: API_ROUTES[route].method ?? 'GET',
        headers: requestHeaders,
        credentials: API_ROUTES[route].credentials ?? undefined,
        body: body ? JSON.stringify(body) : null,
        signal: controller.signal
    }

    const id = setTimeout(() => controller.abort(), timeout ?? 10000)

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
        clearTimeout(id)

        return response
    })
        .then((response: Response) => {
            const jsonResponse: Promise<APIResponse<R>> = response.json()
                .then((apiResponse: APIResponse<R>) => {
                    // show toast if the response is a string
                    if (!apiResponse.error && successMessage) {
                        return presentToast(successMessage, false, DURATIONS.MEDIUM).then(() => apiResponse)
                    }
                    return apiResponse
                })
            logDebug('sendToAPI ' + route, jsonResponse)
            return jsonResponse
        })
        .catch(error => {
            // log the error
            logError('sendToAPI ' + route, error)

            // present a toast to the user
            return presentToast(errorMessage, true, DURATIONS.LONG).then(() => {
                return {
                    error: true,
                    response: (errorMessage ?? 'An error occurred') as R
                }
            })
        })
}


/**
 * Set the cookie details
 * @param cookie
 * @param value
 * @param expirationDate
 */
export function setCookie(cookie: string, value: string, expirationDate: Date) {
    document.cookie = cookie + "=" + value + ";path=/;expires=" + expirationDate.toUTCString();
}