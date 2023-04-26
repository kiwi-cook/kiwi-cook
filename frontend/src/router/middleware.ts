import {State} from "@/storage";
import {Store} from "vuex";

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
    const isAuthenticated: boolean = store.getters.isAuthenticated;
    if (!isAuthenticated) {
        if (to.meta.auth) {
            const redirect = to.query.redirect ? to.query.redirect : to.path;
            next({path: loginRoute, query: {redirect: redirect} });
        } else {
            next();
        }
    } else if (to.path === '/login' && isAuthenticated) {
        next({path: '/'});
    } else {
        next();
    }
}