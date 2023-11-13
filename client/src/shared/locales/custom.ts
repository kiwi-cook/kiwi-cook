import {useI18n} from 'vue-i18n';

export function recipeBy(authors: string, url: string, noLink = false): string {
    const {t} = useI18n()
    const by = t('Recipe.Src.RecipeBy')
    const from = t('Recipe.Src.From')
    const sourceTag = url ? `<a href="${url}" target="_blank">${url}</a>` : ''

    if (authors !== '' && url !== '' && !noLink) {
        return `${by} ${authors} ${from} ${sourceTag}`
    } else if (url === '' || noLink) {
        return `${by} ${authors}`
    } else {
        return sourceTag ?? ''
    }
}