/*
 * Copyright (c) 2023 Josef Müller.
 */

import { logDebug } from '@/shared/utils/logging.ts';

export const toggleDarkTheme = (shouldAdd: boolean) => {
    logDebug('toggleDarkTheme', shouldAdd)
    document.body.classList.toggle('dark', shouldAdd)
}

export const prepareThemeColor = () => {
    // Use matchMedia to check the user preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
    logDebug('prepareThemeColor.prefersDark', prefersDark)

    // Listen for changes to the prefers-color-scheme media query
    prefersDark.addEventListener('change', (e) => {
        toggleDarkTheme(e.matches)
    })

    toggleDarkTheme(prefersDark.matches)
};

