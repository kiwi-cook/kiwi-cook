import {useTasteBuddyStore} from "@/storage";
import {createI18n} from "vue-i18n";
import {nextTick} from 'vue'
import enUS from '@/locales/en.json'

export type LocaleStr = {
    [lang: string]: string
}

export function newLocaleStr(value: string, lang: string) {
    const str: LocaleStr = {}
    setLocaleStr(str, value, lang)
    return str
}

export function getLocaleStr(localeStr: LocaleStr, lang?: string): string {
    const store = useTasteBuddyStore()
    return localeStr[lang ?? store.language.lang] ?? localeStr['en']
}

export function setLocaleStr(localeStr: LocaleStr, value: string, lang?: string) {
    const store = useTasteBuddyStore()
    localeStr[lang ?? store.language.lang] = value;
}

export const SUPPORT_LOCALES = ['en', 'de']
export type SUPPORT_LOCALES_TYPE = 'en' | 'de'

export function setupI18n(options: { locale: SUPPORT_LOCALES_TYPE } = {locale: 'en'}) {
    // Type-define 'en-US' as the master schema for the resource
    type MessageSchema = typeof enUS
    const locale = options.locale

    const i18n = createI18n<[MessageSchema], SUPPORT_LOCALES_TYPE>({
        locale,
        legacy: false,
    })
    setI18nLanguage(i18n, locale)

    // Load texts in english
    loadLocaleMessages(i18n, locale)
    return i18n
}

export const i18n = setupI18n({locale: 'de'})

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
}

export async function loadLocaleMessages(i18n: any, locale: SUPPORT_LOCALES_TYPE) {
    // load locale messages with dynamic import
    const messages = await import(
        /* webpackChunkName: "locale-[request]" */ `@/locales/${locale}.json`
        )

    // set locale and locale message
    i18n.global.setLocaleMessage(locale, messages.default)

    return nextTick()
}