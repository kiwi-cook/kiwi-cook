/*
 * Copyright (c) 2023 Josef Müller.
 */

import {useI18n} from 'vue-i18n';

export function recipeBy(authors: string, url: string, noLink = false): string {
    const {t} = useI18n()
    const sourceTag = url ? `<a href="${url}" target="_blank">${url}</a>` : ''

    if (authors !== '' && url !== '' && !noLink) {
        return t('Recipe.Src.RecipeByWithUrl', [authors, sourceTag])
    } else if (url === '' || noLink) {
        return t('Recipe.Src.RecipeBy', [authors])
    } else {
        return sourceTag ?? ''
    }
}