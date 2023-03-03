// URLs for the API

// API constants
export const API_URL = 'http://localhost:8081/api'
export const API_VERSION = '/v1'

export enum API_ROUTE {
    GET_RECIPES,
    ADD_RECIPE,
    DELETE_RECIPE,
    GET_ITEMS,
    GET_DISCOUNTS,
    GET_MARKETS,
}

export const API_ROUTES: { [key in API_ROUTE]: any } = {
    [API_ROUTE.GET_RECIPES]: { url: '/recipe/', method: 'GET' },
    [API_ROUTE.ADD_RECIPE]: { url: '/recipe/', method: 'POST' },
    [API_ROUTE.DELETE_RECIPE]: { url: '/recipe/RECIPE_ID', method: 'DELETE' },
    [API_ROUTE.GET_ITEMS]: { url: '/item/', method: 'GET' },
    [API_ROUTE.GET_DISCOUNTS]: { url: '/discount/CITY', method: 'GET' },
    [API_ROUTE.GET_MARKETS]: { url: '/discount/markets/CITY', method: 'GET' }
}