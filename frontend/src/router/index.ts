import {createRouter} from '@ionic/vue-router';
import {createWebHashHistory, Router, RouteRecordRaw} from 'vue-router';
import TabsPage from '../views/TabsPage.vue'
import {checkAuthMiddleware, logMiddleware} from "@/router/middleware";
import {State} from '@/storage';
import {Store} from 'vuex';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        component: TabsPage,
        redirect: () => ({ name: 'RecipeOfTheDay'}),
        children: [
            {
                name: 'Home',
                path: 'recipe/',
                component: () => import('@/views/recipe/RecipePage.vue'),
                redirect: to => ({ name: 'RecipeOfTheDay' }),
                children: [
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
                        component: () => import('@/views/recipe/RecipeEditorPage.vue'),
                    }
                ]
            },
            {
                name: 'RecipeSuggestions',
                path: 'recipe/suggestions',
                component: () => import('@/views/recipe/RecipeSuggestionsPage.vue')
            },
            {
                name: 'RecipeOfTheDay',
                path: 'recipe/of-the-day',
                component: () => import('@/views/recipe/RecipeOfTheDayPage.vue')
            },
            {
                name: 'SavedRecipes',
                path: 'recipe/saved',
                component: () => import('@/views/recipe/RecipesListPage.vue')
            },
            {
                name: 'Login',
                path: 'login',
                component: () => import('@/views/user/SignInPage.vue')
            },
            /* 404 */
            {
                name: 'NotFound',
                path: '/:pathMatch(.*)*',
                redirect: to => ({ name: 'SavedRecipes' }),
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
        history: createWebHashHistory(process.env.BASE_URL),
        routes
    })

    router.beforeEach((to, from, next) => {
        logMiddleware(to, from);
        checkAuthMiddleware(to, from, next, store);
    })

    return router;
}
