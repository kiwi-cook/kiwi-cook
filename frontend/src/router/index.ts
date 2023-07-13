import {createRouter} from '@ionic/vue-router';
import {createWebHashHistory, Router, RouteRecordRaw} from 'vue-router';
import TabsPage from '../views/TabsPage.vue'
import {checkAuthMiddleware, logMiddleware} from "@/router/middleware";

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        component: TabsPage,
        redirect: () => ({name: 'RecipeOfTheDay'}),
        children: [
            {
                name: 'Home',
                path: 'recipe/',
                component: () => import('@/views/recipe/RecipePage.vue'),
                redirect: () => ({name: 'RecipeOfTheDay'}),
                children: [
                    {
                        name: 'Recipes',
                        path: 's',
                        component: () => import('@/views/recipe/RecipesListPage.vue')
                    },
                    {
                        name: 'Recipe',
                        path: 's/:id',
                        component: () => import('@/views/recipe/RecipeDetailPage.vue')
                    },
                    {
                        name: 'RecipeEditor',
                        path: 'e/:id',
                        meta: {
                            auth: true,
                        },
                        component: () => import('@/views/editor/RecipeEditorPage.vue'),
                    },
                ]
            },
            {
                name: 'ItemEditor',
                path: 'item/e/',
                meta: {
                    auth: true,
                },
                component: () => import('@/views/editor/ItemsEditorPage.vue'),
            },
            {
                name: 'RecipeSuggestions',
                path: 'recipe/suggestions',
                component: () => import('@/views/RecipeSuggestionsPage.vue')
            },
            {
                name: 'RecipeOfTheDay',
                path: 'recipe/of-the-day',
                component: () => import('@/views/recipe/RecipeOfTheDayPage.vue')
            },
            {
                name: 'SavedRecipes',
                path: 'recipe/saved',
                component: () => import('@/views/recipe/RecipesSaved.vue')
            },
            {
                name: 'Login',
                path: 'login',
                component: () => import('@/views/SignInPage.vue')
            },
            /* 404 */
            {
                name: 'NotFound',
                path: '/:pathMatch(.*)*',
                redirect: () => ({name: 'SavedRecipes'}),
            }
        ]
    }
]

/**
 * Create router
 * @returns {Router}
 */
export function createTasteBuddyRouter(): Router {
    const router = createRouter({
        history: createWebHashHistory(process.env.BASE_URL),
        routes
    })

    router.beforeEach((to, from, next) => {
        logMiddleware(to, from);
        checkAuthMiddleware(to, from, next);
    })

    return router;
}
