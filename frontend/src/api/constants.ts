// URLs for the API

// checks if a URL is reachable
async function checkURL(URL: string) {
    const response = await fetch(URL)
    console.debug(`API_URL: ${URL} -> ${response.ok}`)
    return response.ok
}

// Try to find a reachable API_URL
const possibleAPI_URLS = ['http://localhost:8081/api/v1', 'http://taste-buddy.sh1.hidora.net:8080/api/v1']
export const API_URL = possibleAPI_URLS.find(checkURL) ?? ''
if (API_URL === '') {
    console.error('No API_URL found!')
}

export enum API_ROUTE {
    POST_AUTH,
    GET_AUTH,
    POST_REGISTER,
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
}

export const API_ROUTES: { [key in API_ROUTE]: API_ROUTE_OPTIONS } = {
    [API_ROUTE.POST_AUTH]: {url: '/auth', method: 'POST', contentType: 'application/x-www-form-urlencoded'},
    [API_ROUTE.GET_AUTH]: {url: '/auth', method: 'GET', contentType: 'application/json'},
    [API_ROUTE.POST_REGISTER]: {
        url: '/user/register',
        method: 'POST',
        contentType: 'application/x-www-form-urlencoded'
    },
    [API_ROUTE.GET_RECIPES]: {url: '/recipe', method: 'GET', contentType: 'application/json'},
    [API_ROUTE.ADD_RECIPE]: {url: '/recipe', method: 'POST', contentType: 'application/json'},
    [API_ROUTE.DELETE_RECIPE]: {url: '/recipe/RECIPE_ID', method: 'DELETE'},
    [API_ROUTE.SEARCH_RECIPES]: {url: '/search', method: 'POST', contentType: 'application/json'},
    [API_ROUTE.GET_ITEMS]: {url: '/item', method: 'GET', contentType: 'application/json'},
    [API_ROUTE.ADD_ITEM]: {url: '/item', method: 'POST', contentType: 'application/json'},
    [API_ROUTE.DELETE_ITEM]: {url: '/item/ITEM_ID', method: 'DELETE', contentType: 'application/json'},
    [API_ROUTE.GET_DISCOUNTS]: {url: '/discount/CITY', method: 'GET', contentType: 'application/json'},
    [API_ROUTE.GET_MARKETS]: {url: '/discount/markets/CITY', method: 'GET', contentType: 'application/json'},
}