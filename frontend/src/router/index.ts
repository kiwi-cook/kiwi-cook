import {createRouter} from '@ionic/vue-router';
import {createWebHashHistory, Router, RouteRecordRaw} from 'vue-router';
import {checkAuthMiddleware, logMiddleware} from "@/router/middleware";

// Pages
import TabsPage from '../views/VTabs.vue'
import VRecipeSuggestions from "@/views/recipe/VRecipeSuggestions.vue";

const routes: Array<RouteRecordRaw> = [
    {
        name: 'Home',
        path: '/',
        component: TabsPage,
        redirect: () => ({name: 'RecipeSuggestions'}),
        children: [
            // Recipes
            {
                name: 'Recipe',
                path: 'recipe/show/:id',
                component: () => import('@/views/recipe/VRecipe.vue')
            },
            {
                name: 'RecipeSuggestions',
                path: 'recipe/suggestions',
                component: VRecipeSuggestions
            },
            {
                name: 'RecipeOfTheDay',
                path: 'recipe/of-the-day',
                component: () => import('@/views/recipe/VRecipeOfTheDay.vue')
            },
            {
                name: 'SavedRecipes',
                path: 'recipe/saved',
                component: () => import('@/views/recipe/VSavedRecipes.vue')
            },
            {
                name: 'Recipes',
                path: 'recipe/list',
                component: () => import('@/views/recipe/VRecipes.vue')
            },
            // Editor
            {
                name: 'RecipeEditor',
                path: 'recipe/edit/:id',
                meta: {
                    auth: true,
                },
                component: () => import('@/views/editor/VRecipeEditor.vue'),
            },
            {
                name: 'RecipesEditor',
                path: 'recipe/edit',
                meta: {
                    auth: true,
                },
                component: () => import('@/views/editor/VRecipesEditor.vue'),
            },
            {
                name: 'ItemEditor',
                path: 'item/edit/',
                meta: {
                    auth: true,
                },
                component: () => import('@/views/editor/VItemsEditor.vue'),
            },
            {
                name: 'Login',
                path: 'login',
                component: () => import('@/views/editor/VSignIn.vue'),
            },
            // 404
            {
                name: 'NotFound',
                path: '/:pathMatch(.*)*',
                redirect: () => ({name: 'Home'}),
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
