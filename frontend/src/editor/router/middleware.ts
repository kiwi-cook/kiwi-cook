import {useTasteBuddyStore} from "@/editor/storage";
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

    if (!store.isAuthenticated && to.meta.auth) {
        const redirect = to.query.redirect ? to.query.redirect : to.path;
        next({name: 'Login', query: {redirect: redirect}});
    } else {
        next()
    }
}
