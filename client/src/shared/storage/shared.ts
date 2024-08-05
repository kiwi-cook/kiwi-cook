/*
 * Copyright (c) 2023-2024 Josef Müller.
 */

import { defineStore } from 'pinia';
import { DEFAULT_LOCALE, i18n, setI18nLanguage, SUPPORT_LOCALES, SUPPORT_LOCALES_TYPE } from '@/shared';
import getBrowserLocale from '@/shared/locales/i18n.ts';
import { logDebug } from '@/shared/utils/logging.ts';

interface SharedState {
    language: {
        lang: SUPPORT_LOCALES_TYPE, supportedLanguages: string[]
    },
    loading: { [key: string]: boolean }
}

export const useSharedStore = defineStore('shared', {
    state: (): SharedState => ({
        language: {
            lang: DEFAULT_LOCALE, supportedLanguages: SUPPORT_LOCALES
        }, loading: {
            initial: true,
        },
    }), actions: {
        /**
         * Change the language
         * @param language
         */
        setLanguage(language?: SUPPORT_LOCALES_TYPE) {
            const browserLocale = getBrowserLocale()
            const lang = language ?? browserLocale ?? DEFAULT_LOCALE
            this.language.lang = lang
            setI18nLanguage(i18n, lang)
        }, /**
         * Set the loading state
         * @param key
         */
        startLoading(key: string) {
            logDebug('startLoading', key)
            this.loading[key] = true
        }, /**
         * Finish the loading state
         * @param key
         */
        finishLoading(key: string) {
            logDebug('finishLoading', key)
            this.loading[key] = false
        },
    }, getters: {
        isLoading: (state): boolean => Object.values(state.loading).some((isLoading: boolean) => isLoading),
        isLoadingInitial: (state): boolean => state.loading.initial,
    }
})
