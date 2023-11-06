import {createRouter} from '@ionic/vue-router';
import {createWebHashHistory, NavigationGuardNext, RouteLocationNormalized, Router, RouteRecordRaw} from 'vue-router';
import {beforeEachCheckAuth, beforeEachPrepareStore} from '@/editor/router/middleware';

// Pages
import TabsPage from '@/editor/views/VTabs.vue'
import VHome from '@/editor/views/VHome.vue';
import VRecipe from '@/editor/views/recipe/VRecipe.vue';

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
            // Recipe
            {
                name: 'Recipe',
                path: 'recipe',
                component: VRecipe,
                redirect: () => ({name: 'RecipeList'}),
                children: [
                    {
                        name: 'RecipeList',
                        path: 'list',
                        component: () => import('@/editor/views/recipe/VRecipeList.vue'),
                    },
                    {
                        name: 'RecipeEditor',
                        path: 'editor/:id',
                        component: () => import('@/editor/views/recipe/VRecipeEditor.vue'),
                    },
                    {
                        name: 'RecipeParser',
                        path: 'parser',
                        component: () => import('@/editor/views/recipe/VRecipeParser.vue'),
                    },
                ]
            },
            // Item
            {
                name: 'ItemEditor',
                path: 'item/editor',
                meta: {
                    auth: true,
                },
                component: () => import('@/editor/views/item/VItemsEditor.vue'),
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
        // prepare the store
        beforeEachPrepareStore(to, from, next).then(() => {
            // check if the user is authenticated
            beforeEachCheckAuth(to, from, next);
        })
    })

    return router;
}
