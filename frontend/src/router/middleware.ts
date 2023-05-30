import { State } from "@/storage";
import { logDebug } from "@/tastebuddy";
import { Store } from "vuex";

export const logMiddleware = (to: any, from: any) => {
    logDebug('router', `routing from ${from.path} -> ${to.path}`)
}

/**
 * Vue Router middleware to check if user is authenticated
 * @returns
 * @param to
 * @param from
 * @param next
 * @param store
 * @param loginRoute
 */
export const checkAuthMiddleware = (to: any, from: any, next: any, store: Store<State>, loginRoute: string) => {
    const isAuthenticated = store.getters.isAuthenticated;
    logDebug('router', `checking auth for ${to.path} (isAuthenticated: ${isAuthenticated})`)
    if (to.meta.auth) {
        if (isAuthenticated) {
            store.dispatch('sessionAuth').then(next())
            const redirect = to.query.redirect ? to.query.redirect : to.path;
            next({ path: loginRoute, query: { redirect: redirect } });
        } else {
            next();
        }
    } else if (to.path === '/login' && isAuthenticated) {
        next({ path: '/' });
    } else {
        next();
    }
}