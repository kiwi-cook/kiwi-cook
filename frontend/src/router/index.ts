import {createRouter, createWebHistory} from '@ionic/vue-router';
import {Router, RouteRecordRaw} from 'vue-router';
import TabsPage from '../views/TabsPage.vue'
import {checkAuthMiddleware, logMiddleware} from "@/router/middleware";
import {State} from '@/storage';
import {Store} from 'vuex';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        component: TabsPage,
        redirect: 'recipe/of-the-day',
        children: [
            {
                path: 'recipe',
                component: () => import('@/views/recipe/RecipePage.vue'),
                redirect: 'recipe/saved',
                children: [
                    {
                        path: ':id',
                        component: () => import('@/views/recipe/RecipeDetailPage.vue')
                    },
                    {
                        path: ':id/edit',
                        meta: {
                            auth: true,
                        },
                        component: () => import('@/views/recipe/RecipeEditorPage.vue'),
                    }
                ]
            },
            /* {
                path: 'recipe/suggestions',
                component: () => import('@/views/recipe/RecipeSuggestionsPage.vue')
            }, */
            {
                path: 'recipe/of-the-day',
                component: () => import('@/views/recipe/RecipeOfTheDayPage.vue')
            },
            {
                path: 'recipe/saved',
                component: () => import('@/views/recipe/RecipesListPage.vue')
            },
            {
                path: 'login',
                component: () => import('@/views/user/SignInPage.vue')
            },
            /* 404 */
            {
                path: '/:pathMatch(.*)*',
                redirect: '/recipe/saved'
            }
        ]
    }
]

/**
 * Create router
 * @returns {Router}
 */
export function createTasteBuddyRouter(store: Store<State>): Router {
    const router = createRouter({
        history: createWebHistory(process.env.BASE_URL),
        routes
    })

    router.beforeEach((to, from, next) => {
        logMiddleware(to, from);
        checkAuthMiddleware(to, from, next, store, '/login');
    })

    return router;
}
