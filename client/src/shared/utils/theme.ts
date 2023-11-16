/*
 * Copyright (c) 2023 Josef Müller.
 */

export const toggleDarkTheme = (shouldAdd: boolean) => document.body.classList.toggle('dark', shouldAdd);
export const prepareThemeColor = () => {
    // Use matchMedia to check the user preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    console.log('prefersDark', prefersDark)

    // Listen for changes to the prefers-color-scheme media query
    prefersDark.addEventListener('change', (e) => {
        toggleDarkTheme(e.matches);
    });

    toggleDarkTheme(prefersDark.matches);
};

