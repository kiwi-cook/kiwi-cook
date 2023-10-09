import {createRouter} from '@ionic/vue-router';
import {createWebHashHistory, NavigationGuardNext, RouteLocationNormalized, Router, RouteRecordRaw} from 'vue-router';
import {beforeEachCheckAuth} from "@/app/router/middleware";

// Pages
import TabsPage from '@/shared/views/VTabs.vue'
import VRecipe from "@/shared/views/VRecipe.vue";

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
                component: VRecipe
            },
            // Editor
            {
                name: 'RecipeEditor',
                path: 'recipe/edit/:id',
                meta: {
                    auth: true,
                },
                component: () => import('@/app/views/editor/VRecipeEditor.vue'),
            },
            {
                name: 'RecipesEditor',
                path: 'recipe/edit',
                meta: {
                    auth: true,
                },
                component: () => import('@/app/views/editor/VRecipesEditor.vue'),
            },
            {
                name: 'ItemEditor',
                path: 'item/edit/',
                meta: {
                    auth: true,
                },
                component: () => import('@/app/views/editor/VItemsEditor.vue'),
            },
            {
                name: 'Login',
                path: 'login',
                component: () => import('@/app/views/editor/VSignIn.vue'),
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

    router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
        beforeEachCheckAuth(to, from, next);
    })

    return router;
}
