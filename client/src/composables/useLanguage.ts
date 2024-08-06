/*
 * Copyright (c) 2023-2024 Josef Müller.
 */

import { ref, watch } from 'vue';
import { DEFAULT_LOCALE, i18n, setI18nLanguage, SUPPORT_LOCALES, SUPPORT_LOCALES_TYPE } from '@/shared';
import getBrowserLocale from '@/shared/locales/i18n';

export function useLanguage() {
    const lang = ref<SUPPORT_LOCALES_TYPE>(DEFAULT_LOCALE);
    const supportedLanguages = ref<string[]>(SUPPORT_LOCALES);

    function setLanguage(language?: SUPPORT_LOCALES_TYPE) {
        const browserLocale = getBrowserLocale();
        lang.value = language ?? browserLocale ?? DEFAULT_LOCALE;
        setI18nLanguage(i18n, lang.value);
    }

    watch(lang, (newLang) => {
        setI18nLanguage(i18n, newLang);
    });

    setLanguage();

    return {
        lang,
        supportedLanguages,
        setLanguage
    };
}
