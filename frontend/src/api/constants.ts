// URLs for the API

// API constants
export const API_URL = 'http://localhost:8081/api'
export const API_VERSION = '/v1'

export enum API_ROUTE {
    GET_RECIPES,
    ADD_RECIPE,
    SEARCH_RECIPES,
    GET_ITEMS,
    GET_DISCOUNTS,
    GET_MARKETS,
}

type API_ROUTE_OPTIONS = {
    url: string;
    method: string;
}

export const API_ROUTES: { [key in API_ROUTE]: API_ROUTE_OPTIONS } = {
    [API_ROUTE.GET_RECIPES]: { url: '/recipe/', method: 'GET' },
    [API_ROUTE.ADD_RECIPE]: { url: '/recipe/', method: 'POST' },
    [API_ROUTE.SEARCH_RECIPES]: { url: '/search', method: 'POST' },
    [API_ROUTE.GET_ITEMS]: { url: '/item/', method: 'GET' },
    [API_ROUTE.GET_DISCOUNTS]: { url: '/discount/CITY', method: 'GET' },
    [API_ROUTE.GET_MARKETS]: { url: '/discount/markets/CITY', method: 'GET' },
}