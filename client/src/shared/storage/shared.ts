/*
 * Copyright (c) 2023 Josef Müller.
 */

import {defineStore} from 'pinia';
import {DEFAULT_LOCALE, i18n, setI18nLanguage, SUPPORT_LOCALES, SUPPORT_LOCALES_TYPE} from '@/shared';
import getBrowserLocale from '@/shared/locales/i18n.ts';

interface TasteBuddyState {
    language: {
        lang: SUPPORT_LOCALES_TYPE,
        supportedLanguages: string[]
    },
}

export const useSharedStore = defineStore('tastebuddy-shared', {
    state: (): TasteBuddyState => ({
        language: {
            lang: DEFAULT_LOCALE,
            supportedLanguages: SUPPORT_LOCALES
        }
    }),
    actions: {
        /**
         * Change the language
         * @param language
         */
        setLanguage(language?: SUPPORT_LOCALES_TYPE) {
            const browserLocale = getBrowserLocale()
            const lang = language ?? browserLocale ?? DEFAULT_LOCALE
            this.language.lang = lang
            setI18nLanguage(i18n, lang)
        },
    }
})