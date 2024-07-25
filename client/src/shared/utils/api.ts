/*
 * Copyright (c) 2023-2024 Josef Müller.
 */

import {Item, presentToast, Recipe} from '@/shared';
import {RecipeSuggestion} from '@/app/search';
import {logDebug, logError} from '@/shared/utils/logging';

// URLs for the API

// Possible URLs for the API
const possibleAPI_URLS = ['https://tastebuddy-1-k6629823.deta.app', 'http://localhost:8081']

export const API_URL = process.env.NODE_ENV === 'development' ? possibleAPI_URLS[1] : possibleAPI_URLS[0]

export enum API_ROUTE {
    GET_RECIPES, ADD_RECIPES, PARSE_RECIPES, DELETE_RECIPES, GET_ITEMS, ADD_ITEMS, DELETE_ITEMS
}

const JSONTYPE = 'application/json'


type API_ROUTE_OPTIONS = {
    url: string;
    method: string;
    contentType: 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
    credentials?: 'include' | 'omit' | 'same-origin';
}

export const API_ROUTES: { [key in API_ROUTE]: API_ROUTE_OPTIONS } = {
    [API_ROUTE.GET_RECIPES]: {url: '/recipe', method: 'GET', contentType: JSONTYPE},
    [API_ROUTE.ADD_RECIPES]: {url: '/recipe', method: 'POST', contentType: JSONTYPE, credentials: 'include'},
    [API_ROUTE.PARSE_RECIPES]: {url: '/recipe/parse', method: 'POST', contentType: JSONTYPE},
    [API_ROUTE.DELETE_RECIPES]: {
        url: '/recipe', method: 'DELETE', contentType: JSONTYPE, credentials: 'include'
    },
    [API_ROUTE.GET_ITEMS]: {url: '/item', method: 'GET', contentType: JSONTYPE},
    [API_ROUTE.ADD_ITEMS]: {url: '/item', method: 'POST', contentType: JSONTYPE, credentials: 'include'},
    [API_ROUTE.DELETE_ITEMS]: {
        url: '/item', method: 'DELETE', contentType: JSONTYPE, credentials: 'include'
    }
}

export const DURATIONS = {
    SHORT: 3000, MEDIUM: 4000, LONG: 5000,
}

type APIResponseBody = Recipe[] | Item[] | RecipeSuggestion[] | string

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
export function sendToAPI<R extends APIResponseBody>(route: API_ROUTE, options?: SendToApiOptions): Promise<APIResponse<R>> {
    const url = API_URL + API_ROUTES[route].url;

    const {body, headers, errorMessage, successMessage, timeout} = options ?? {}

    // headers
    const requestHeaders = new Headers();
    requestHeaders.append('Content-Type', API_ROUTES[route].contentType);
    for (const header of headers ?? []) {
        requestHeaders.append(header.key, header.value);
    }

    const fetchOptions: RequestInit = {
        method: API_ROUTES[route].method,
        headers: requestHeaders,
        credentials: API_ROUTES[route].credentials,
        body: body ? JSON.stringify(body) : null,
        signal: controller.signal
    }

    const id = setTimeout(() => controller.abort(), timeout ?? 10000)

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

            // present a toast to the user
            return presentToast(errorMessage, true, DURATIONS.LONG)
                .then(() => ({
                    error: true, response: (errorMessage ?? 'An error occurred') as R
                }))
        }).finally(() => {
            clearTimeout(id)
            return controller.abort()
        })
}
