/*
 * Copyright (c) 2023-2024 Josef Müller.
 */

import { createI18n } from 'vue-i18n';
import { nextTick } from 'vue'
import enUS from '@/shared/locales/en.json'
import { RouteLocationNormalized } from 'vue-router';
import { logDebug, logWarn } from '@/shared/utils/logging';
import { useSharedStore } from '@/shared/storage';

export type SUPPORT_LOCALES_TYPE = 'en' | 'de'
export const SUPPORT_LOCALES: SUPPORT_LOCALES_TYPE[] = ['en', 'de']

export const DEFAULT_LOCALE: SUPPORT_LOCALES_TYPE = 'en'

export interface MultiLanguageFieldTranslations {
    [lang: string]: string;
}

export class MultiLanguageField {
    translations: MultiLanguageFieldTranslations;

    constructor(translations: MultiLanguageFieldTranslations = {}) {
        this.translations = translations;
    }

    static new(value?: string, lang?: string): MultiLanguageField {
        return new MultiLanguageField({ [lang ?? DEFAULT_LOCALE]: value ?? '' });
    }

    static fromJSON(json: any): MultiLanguageField {
        return new MultiLanguageField(json.translations);
    }

    get(lang?: string) {
        let str: string
        if (!lang) {
            str = this.translations[DEFAULT_LOCALE] || '';
        } else {
            str = this.translations[lang] || '';
        }
        if (!str) {
            str = this.translations[this.getLangs()[0]]
        }
        return str;
    }

    set(value: string, lang?: string) {
        if (!lang) {
            this.translations[DEFAULT_LOCALE] = value;
            return;
        }
        this.translations[lang] = value;
    }

    /**
     * Get all languages
     */
    getLangs(): string[] {
        return Object.keys(this.translations);
    }

    /**
     * Get all translations
     */
    getAll(): string[] {
        return Object.values(this.translations);
    }
}

export function setupI18n(options: { locale: SUPPORT_LOCALES_TYPE } = { locale: DEFAULT_LOCALE }) {
    type MessageSchema = typeof enUS
    const locale = options.locale

    const i18n = createI18n<[MessageSchema], SUPPORT_LOCALES_TYPE>({
        locale, legacy: false, fallbackWarn: false, missingWarn: false,
    })
    setI18nLanguage(i18n, locale)
    return i18n
}

export const i18n = setupI18n({ locale: 'de' })

/**
 * Change the language of the app
 * IMPORTANT: Should only be called by store since the store is the SSOT!
 * @param i18n the i18n instance
 * @param locale the locale to change to
 */
export function setI18nLanguage(i18n: any, locale: SUPPORT_LOCALES_TYPE) {
    if (i18n.mode === 'legacy') {
        i18n.global.locale = locale
    } else {
        i18n.global.locale.value = locale
    }
    /**
     * NOTE:
     * If you need to specify the language setting for headers, such as the `fetch` API, set it here.
     * The following is an example for axios.
     *
     * axios.defaults.headers.common['Accept-Language'] = locale
     */
    document.querySelector('html')?.setAttribute('lang', locale)
    loadLocaleMessages(i18n, locale)
}

/**
 * Load the locale messages
 * @param i18n the i18n instance
 * @param locale the locale to load
 */
async function loadLocaleMessages(i18n: any, locale: SUPPORT_LOCALES_TYPE) {
    // load locale messages with dynamic import
    const messages = await import(
        /* webpackChunkName: "locale-[request]" */ `@/shared/locales/${locale}.json`
        )

    // set locale and locale message
    i18n.global.setLocaleMessage(locale, messages.default)

    return nextTick()
}

/**
 * Get the browser locale
 *
 * @copyright Mohammad Ashour
 * @see https://phrase.com/blog/posts/ultimate-guide-to-vue-localization-with-vue-i18n/
 */
export default function getBrowserLocale(): SUPPORT_LOCALES_TYPE | undefined {
    const fName = getBrowserLocale.name
    const navigatorLocale = navigator.languages !== undefined ? navigator.languages[0] : navigator.language
    logDebug(fName, 'navigatorLocale:', navigatorLocale)

    if (!navigatorLocale) {
        logWarn(fName, 'no locale found')
        return undefined
    }

    const locale = navigatorLocale.trim().split(/[-_]/)[0]
    logDebug(fName, 'locale:', locale)
    if (!SUPPORT_LOCALES.includes(locale as SUPPORT_LOCALES_TYPE)) {
        logWarn(fName, `locale '${locale}' is not supported.`)
        return undefined
    }
    return locale as SUPPORT_LOCALES_TYPE
}

/**
 * Vue Router middleware to set the language.
 * This middleware is called before each route change.
 *
 * @param to the route to change to. It contains the language in the query parameter "lang"
 */
export const beforeEachSetLang = async (to: RouteLocationNormalized) => {
    const paramsLocationQueryValue = to.query.lang
    const lang: SUPPORT_LOCALES_TYPE = (Array.isArray(paramsLocationQueryValue) ? paramsLocationQueryValue[0] : paramsLocationQueryValue) as SUPPORT_LOCALES_TYPE
    logDebug("setI18nLangMiddleware', 'set lang:", lang)

    // use locale if paramsLocale is not in SUPPORT_LOCALES
    if (!SUPPORT_LOCALES.includes(lang)) {
        return
    }

    // load locale messages
    if (!i18n.global.availableLocales.includes(lang)) {
        await loadLocaleMessages(i18n, lang)
    }

    // set i18n language via the store
    const sharedStore = useSharedStore()
    sharedStore.setLanguage(lang)
}
