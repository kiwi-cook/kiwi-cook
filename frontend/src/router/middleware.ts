import {logDebug} from "@/tastebuddy";
import {useTasteBuddyStore} from "@/storage";
import {NavigationGuardNext, RouteLocationNormalized} from "vue-router";


/**
 * Vue Router middleware to check if user is authenticated
 * @returns
 * @param to
 * @param from
 * @param next
 */
export const beforeEachCheckAuth = (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    const store = useTasteBuddyStore();
    let authenticated = false
    if (to.meta.auth) {
        authenticated = store.isAuthenticated
    }

    // if user is not in dev mode, redirect to home if they try to go to login page
    if ((to.name === 'Login' || to.meta.auth) && !store.isDevMode) {
        logDebug('checkAuthMiddleware', 'Return to home')
        next({name: 'Home'})
    } else if (!authenticated && to.meta.auth) {
        const redirect = to.query.redirect ? to.query.redirect : to.path;
        next({name: 'Login', query: {redirect: redirect}});
    } else {
        next()
    }
}
