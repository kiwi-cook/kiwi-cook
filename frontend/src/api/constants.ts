// URLs for the API

// API constants
export const API_URL = 'http://localhost:8081/api'
export const API_VERSION = '/v1'

// basic API routes
const API_ROUTES = {
    RECIPES: '/recipe/',
    ITEMS: '/item/',
    DISCOUNTS: '/discount/',
    MARKETS: '/market/',
}

export enum API_ROUTE {
    RECIPES,
    ITEMS,
    DISCOUNTS,
    MARKETS
}

// get API route by type
export const getApiRoute = (route: API_ROUTE): string => {
    const basis = API_URL + API_VERSION;
    switch (route) {
        case API_ROUTE.ITEMS:
            return basis + API_ROUTES.ITEMS;
        case API_ROUTE.DISCOUNTS:
            return basis + API_ROUTES.DISCOUNTS;
        case API_ROUTE.MARKETS:
            return basis + API_ROUTES.MARKETS;
    }
    return basis + API_ROUTES.RECIPES;
}
