/*
 * Copyright (c) 2023-2024 Josef Müller.
 */

import { Ingredient, Recipe, RecipeSuggestion } from '@/models';
import { logDebug, logError, logWarn } from '@/shared/utils/logging';
import { config } from '@/config.ts';
import { presentToast } from '@/shared';

const MODULE = 'shared.utils.api.';

const isDev = process.env.NODE_ENV === 'development';
export let API_URL: string | null = '';

const findApiUrl = async () => {
    logDebug('API_URL', 'Checking for reachable API URL ...');
    const funcName = MODULE + 'findApiUrl';

    for (const { url } of config.apiUrls.filter(api => isDev ? api.name === 'dev' : api.name === 'prod')) {
        try {
            const response = await fetch(url, { method: 'GET' });

            if (response.ok) {
                logDebug(funcName, 'Found reachable API URL: ' + url);
                return url as string;
            } else {
                logDebug(funcName, 'API URL is not reachable: ' + url);
            }
        } catch (error) {
            logError(funcName, `Failed to fetch URL ${url}`, error);
        }
    }

    logWarn(funcName, 'No reachable API URL found. We are offline.');
    return null
};


export enum API_ROUTE {
    GET_RECIPES,
    ADD_RECIPES,
    ADD_RECIPE_VIA_URL,
    PARSE_RECIPES,
    DELETE_RECIPES,
    GET_INGREDIENTS,
    ADD_INGREDIENTS,
    DELETE_INGREDIENTS,
    IMAGE_TO_INGREDIENTS,
}

const JSONTYPE = 'application/json'


type API_ROUTE_OPTIONS = {
    url: string;
    method: string;
    contentType?: 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
    credentials?: 'include' | 'omit' | 'same-origin';
}

export const API_ROUTES: { [key in API_ROUTE]: API_ROUTE_OPTIONS } = {
    [API_ROUTE.GET_RECIPES]: { url: '/recipe/', method: 'GET', contentType: JSONTYPE },
    [API_ROUTE.ADD_RECIPE_VIA_URL]: {
        url: '/recipe/add',
        method: 'GET',
        contentType: JSONTYPE,
    },
    [API_ROUTE.ADD_RECIPES]: { url: '/recipe/', method: 'POST', contentType: JSONTYPE, credentials: 'include' },
    [API_ROUTE.PARSE_RECIPES]: { url: '/recipe/parse', method: 'POST', contentType: JSONTYPE },
    [API_ROUTE.DELETE_RECIPES]: {
        url: '/recipe/', method: 'DELETE', contentType: JSONTYPE, credentials: 'include'
    },
    [API_ROUTE.GET_INGREDIENTS]: { url: '/ingredient/', method: 'GET', contentType: JSONTYPE },
    [API_ROUTE.ADD_INGREDIENTS]: { url: '/ingredient/', method: 'POST', contentType: JSONTYPE, credentials: 'include' },
    [API_ROUTE.DELETE_INGREDIENTS]: {
        url: '/ingredient/', method: 'DELETE', contentType: JSONTYPE, credentials: 'include'
    },
    [API_ROUTE.IMAGE_TO_INGREDIENTS]: { url: '/ingredient/image', method: 'POST' },
}

export const DURATIONS = {
    SHORT: 3000, MEDIUM: 4000, LONG: 5000,
}

type APIResponseBody = Recipe[] | Ingredient[] | RecipeSuggestion[] | string | string[]

/**
 * This is the response interface from the API
 */
export interface APIResponse<T extends APIResponseBody> {
    error: boolean
    response: T,
    id?: string
}

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
export async function sendToAPI<R extends APIResponseBody>(route: API_ROUTE, options?: SendToApiOptions): Promise<APIResponse<R>> {
    if (API_URL === '') {
        API_URL = await findApiUrl();
    }

    if (!API_URL) {
        return { error: true, response: 'Could not connect to the server.' as R }
    }

    let url = API_URL + API_ROUTES[route].url;

    let { body } = options ?? {}
    const { headers, errorMessage, successMessage, timeout } = options ?? {}

    // format the object to a query string
    if (options?.formatObject) {
        const queryString = Object.keys(options.formatObject)
            .map(key => `${key}=${options.formatObject![key]}`)
            .join('&')
        url += '?' + queryString
    }

    // headers
    const requestHeaders = new Headers();
    if (API_ROUTES[route].contentType) {
        requestHeaders.append('Content-Type', API_ROUTES[route].contentType);
    }
    for (const header of headers ?? []) {
        requestHeaders.append(header.key, header.value);
    }

    // Abort Controller for the fetch function used in sendToAPI
    const abortController = new AbortController()

    // if the body is not null and the content type is application/json
    if (body !== null && API_ROUTES[route].contentType === 'application/json') {
        body = JSON.stringify(body)
    }

    const fetchOptions: RequestInit = {
        method: API_ROUTES[route].method,
        headers: requestHeaders,
        credentials: API_ROUTES[route].credentials,
        body: body as BodyInit,
        signal: abortController.signal
    }

    const id = setTimeout(() => abortController.abort(), timeout ?? 10000)

    // call fetch
    logDebug('sendToAPI ' + route, fetchOptions)
    return fetch(url, fetchOptions)
        .then((response: Response) => {
            // set cookie if it is in the response
            if (response.headers.has('set-cookie')) {
                const cookie = response.headers.get('set-cookie')
                logDebug('sendToAPI.cookie', cookie)
                if (cookie) {
                    document.cookie = cookie
                }
            }
            clearTimeout(id)

            return response
        })
        .then((response: Response) => response.json())
        .then((apiResponse: APIResponse<R>) => {
            // show toast if the response is a string
            if (!apiResponse.error && successMessage) {
                return presentToast(successMessage, false, DURATIONS.MEDIUM).then(() => apiResponse)
            }
            return apiResponse
        })
        .catch(error => {
            // log the error
            logError('sendToAPI ' + route, error)

            // present toast to the user
            return presentToast(errorMessage, true, DURATIONS.LONG)
                .then(() => ({
                    error: true, response: (errorMessage ?? 'An error occurred') as R
                }))
        }).finally(() => {
            clearTimeout(id)
            abortController.abort()
        })
}
