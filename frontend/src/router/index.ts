import {createRouter, createWebHistory} from '@ionic/vue-router';
import {Router, RouteRecordRaw} from 'vue-router';
import TabsPage from '../views/TabsPage.vue'
import {checkAuthMiddleware} from "@/router/middleware";
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
                children: [
                    {
                        path: '',
                        component: () => import('@/views/recipe/RecipesListPage.vue')
                    },
                    {
                        path: 'of-the-day',
                        component: () => import('@/views/recipe/RecipeOfTheDayPage.vue')
                    },
                    {
                        path: ':id',
                        component: () => import('@/views/recipe/RecipeDetailPage.vue')
                    }
                ]
            },
            {
                path: 'fridge',
                component: () => import('@/views/FridgePage.vue')
            },
            {
                path: 'shopping',
                component: () => import('@/views/ShoppingPage.vue'),
            },
            {
                path: 'user',
                component: () => import('@/views/user/UserPage.vue'),
                meta: {
                    auth: true,
                }
            },
            {
                path: 'login',
                component: () => import('@/views/user/LoginPage.vue')
            },
            {
                path: 'register',
                component: () => import('@/views/user/RegisterPage.vue')
            }
        ]
    }
]

if (process.env.NODE_ENV === 'development') {
    const devRoutes = [
        {
            path: '/editor',
            component: () => import('@/views/editor/EditorPage.vue'),
            meta: {
                auth: true,
            }
        }
    ]

    routes.push(...devRoutes);
}


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
        checkAuthMiddleware(to, from, next, store, '/login');
    })

    return router;
}
