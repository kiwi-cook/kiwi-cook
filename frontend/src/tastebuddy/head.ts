import {APP_NAME, Recipe} from "@/tastebuddy";
import {createHead, useSeoMeta, VueHeadClient} from "@unhead/vue";

const recipeTitle = (recipe?: Recipe) => recipe ? `${APP_NAME} | ${recipe?.getName()}` : APP_NAME
export const head = createHead()

export const renderNormalHead = (head?: VueHeadClient<any>) => {
    useSeoMeta({
        title: () => recipeTitle() ?? APP_NAME,
        ogTitle: () => recipeTitle() ?? APP_NAME,
        charset: 'utf-8',
        description: () => `Discover the best recipes on ${APP_NAME}. Quick, easy, and perfect for busy weeknights.`,
        ogLocale: 'de',
        ogLocaleAlternate: ['en'],
        ogType: 'article',
        ogSiteName: APP_NAME,
    }, {head})
}

export const renderRecipeHead = (head?: VueHeadClient<any>, recipe?: Recipe) => {
    useSeoMeta({
        title: () => recipeTitle(recipe) ?? APP_NAME,
        ogTitle: () => recipeTitle(recipe) ?? APP_NAME,
        charset: 'utf-8',
        description: () => `Discover the best ${recipe?.getName()} recipes on ${APP_NAME}. Quick, easy, and perfect for busy weeknights.`,
        ogImage: () => recipe?.props?.imgUrl ?? undefined,
        ogLocale: 'de',
        ogLocaleAlternate: ['en'],
        ogType: 'article',
        ogSiteName: APP_NAME,
    }, {head})
}

let pauseDOMUpdates = true
head.hooks.hook('dom:beforeRender', (context) => {
    context.shouldRender = !pauseDOMUpdates
})

/**
 * Middleware to pause DOM updates when route changes (trigger immediately)
 */
export const beforeEachPauseHead = () => {
    pauseDOMUpdates = true
}

/**
 * Middleware to watch for new route before unpausing dom updates (triggered after suspense resolved)
 */
export const afterEachResumeHead = () => {
    // only if we have paused (clicking on a link to the current route triggers this)
    if (pauseDOMUpdates) {
        pauseDOMUpdates = false
        renderNormalHead(head)
    }
}