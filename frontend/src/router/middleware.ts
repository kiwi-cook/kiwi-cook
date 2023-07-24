import {logDebug} from "@/tastebuddy";
import {useTasteBuddyStore} from "@/storage";

export const logMiddleware = (to: any, from: any) => {
    logDebug('middleware.router', `routing from ${from.path} -> ${to.path}`)
}

/**
 * Vue Router middleware to check if user is authenticated
 * @returns
 * @param to
 * @param from
 * @param next
 */
export const checkAuthMiddleware = (to: any, from: any, next: any) => {
    const store = useTasteBuddyStore();
    if (to.meta.auth) {
        if (store.isDevMode) {   
            store.sessionAuth().then((isAuthenticated: boolean) => {
                logDebug('checkAuthMiddleware', `auth required for ${to.path} -> ${isAuthenticated}`)
                if (isAuthenticated) {
                    next()
                } else {
                    const redirect = to.query.redirect ? to.query.redirect : to.path;
                    next({name: 'Login', query: {redirect: redirect}});
                }
            })
        }
    } else {
        next();
    }
}