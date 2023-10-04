import {logDebug} from "@/tastebuddy";
import {useTasteBuddyStore} from "@/storage";
import {i18n, loadLocaleMessages, setI18nLanguage, SUPPORT_LOCALES, SUPPORT_LOCALES_TYPE} from "@/locales/i18n.ts";
import {NavigationGuardNext, RouteLocationNormalized} from "vue-router";

export const logMiddleware = (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
    logDebug('middleware.router', `routing from ${from.path} => ${to.path}`)
}

/**
 * Vue Router middleware to check if user is authenticated
 * @returns
 * @param to
 * @param from
 * @param next
 */
export const checkAuthMiddleware = (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
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

/**
 * Vue Router middleware to set the language
 * @returns
 * @param to
 */
export const setI18nLangMiddleware = async (to: RouteLocationNormalized) => {
    const paramsLocationQueryValue = to.query.lang
    const lang: SUPPORT_LOCALES_TYPE = (Array.isArray(paramsLocationQueryValue) ? paramsLocationQueryValue[0] : paramsLocationQueryValue) as SUPPORT_LOCALES_TYPE
    logDebug('setI18nLangMiddleware', 'set lang:', lang)

    const store = useTasteBuddyStore();

    // use locale if paramsLocale is not in SUPPORT_LOCALES
    if (!SUPPORT_LOCALES.includes(lang)) {
        return
    }

    // load locale messages
    if (!i18n.global.availableLocales.includes(lang)) {
        await loadLocaleMessages(i18n, lang)
    }

    // set i18n language
    setI18nLanguage(i18n, lang)
    store.setLanguage(lang)
}