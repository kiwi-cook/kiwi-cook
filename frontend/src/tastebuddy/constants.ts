// URLs for the API

// Possible URLs for the API
const possibleAPI_URLS = ['https://tastebuddy-1-k6629823.deta.app/api/v1', 'http://localhost:8081/api/v1']

export const API_URL = process.env.NODE_ENV === 'development' ? possibleAPI_URLS[1] : possibleAPI_URLS[0]

export enum API_ROUTE {
    POST_AUTH,
    GET_AUTH,
    POST_LOGOUT,
    GET_RECIPES,
    ADD_RECIPE,
    DELETE_RECIPE,
    SEARCH_RECIPES,
    GET_ITEMS,
    ADD_ITEM,
    DELETE_ITEM,
    GET_DISCOUNTS,
    GET_MARKETS,
}

type API_ROUTE_OPTIONS = {
    url: string;
    method: string;
    contentType?: 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
    credentials?: 'include' | 'omit' | 'same-origin' | undefined;
}

export const API_ROUTES: { [key in API_ROUTE]: API_ROUTE_OPTIONS } = {
    [API_ROUTE.POST_AUTH]: { url: '/auth', method: 'POST', contentType: 'application/x-www-form-urlencoded', credentials: 'include' },
    [API_ROUTE.POST_LOGOUT]: { url: '/auth', method: 'POST', contentType: 'application/json' },
    [API_ROUTE.GET_AUTH]: { url: '/auth', method: 'GET', contentType: 'application/json', credentials: 'include' },
    [API_ROUTE.GET_RECIPES]: { url: '/recipe', method: 'GET', contentType: 'application/json' },
    [API_ROUTE.ADD_RECIPE]: { url: '/recipe', method: 'POST', contentType: 'application/json', credentials: 'include' },
    [API_ROUTE.DELETE_RECIPE]: { url: '/recipe/RECIPE_ID', method: 'DELETE', contentType: 'application/json', credentials: 'include' },
    [API_ROUTE.SEARCH_RECIPES]: { url: '/search', method: 'POST', contentType: 'application/json' },
    [API_ROUTE.GET_ITEMS]: { url: '/item', method: 'GET', contentType: 'application/json' },
    [API_ROUTE.ADD_ITEM]: { url: '/item', method: 'POST', contentType: 'application/json', credentials: 'include' },
    [API_ROUTE.DELETE_ITEM]: { url: '/item/ITEM_ID', method: 'DELETE', contentType: 'application/json', credentials: 'include' },
    [API_ROUTE.GET_DISCOUNTS]: { url: '/discount/CITY', method: 'GET', contentType: 'application/json' },
    [API_ROUTE.GET_MARKETS]: { url: '/discount/markets/CITY', method: 'GET', contentType: 'application/json' },
}