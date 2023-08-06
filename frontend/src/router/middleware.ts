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
// eslint-disable-next-line sonarjs/cognitive-complexity
export const checkAuthMiddleware = (to: any, from: any, next: any) => {
    const goHome = () => next({name: 'Home'})
    const store = useTasteBuddyStore();

    // if user is not in dev mode, redirect to home if they try to go to login page
    if (to.name === 'Login' && !store.isDevMode) {
        goHome()
    }

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
        } else {
            return goHome()
        }
    } else {
        next();
    }
}