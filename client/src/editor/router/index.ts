import {createRouter} from '@ionic/vue-router';
import {createWebHashHistory, NavigationGuardNext, RouteLocationNormalized, Router, RouteRecordRaw} from 'vue-router';
import {beforeEachCheckAuth} from '@/editor/router/middleware';

// Pages
import TabsPage from '@/editor/views/VTabs.vue'
import VRecipe from '@/shared/views/VRecipe.vue';
import VHome from '@/editor/views/VHome.vue';

const routes: Array<RouteRecordRaw> = [
    {
        name: 'Tabs',
        path: '/',
        component: TabsPage,
        redirect: () => ({name: 'Home'}),
        children: [
            {
                name: 'Home',
                path: 'home',
                component: VHome
            },
            // Recipes
            {
                name: 'Recipe',
                path: 'recipe/show/:id',
                component: VRecipe
            },
            // Editor
            {
                name: 'RecipeEditor',
                path: 'editor/recipe/:id',
                meta: {
                    auth: true,
                },
                component: () => import('@/editor/views/VRecipeEditor.vue'),
            },
            {
                name: 'RecipesEditor',
                path: 'editor/recipe',
                meta: {
                    auth: true,
                },
                component: () => import('@/editor/views/VRecipesEditor.vue'),
            },
            {
                name: 'ItemEditor',
                path: 'editor/item',
                meta: {
                    auth: true,
                },
                component: () => import('@/editor/views/VItemsEditor.vue'),
            },
            {
                name: 'Login',
                path: 'login',
                component: () => import('@/editor/views/VSignIn.vue'),
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
