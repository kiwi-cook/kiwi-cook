import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        component: TabsPage,
        redirect: '/start',
        children: [
            {
                path: 'start',
                component: () => import('@/views/recipe/RecipeOfTheDayPage.vue')
            },
            {
                path: 'fridge',
                component: () => import('@/views/FridgePage.vue')
            },
            {
                path: 'recipe',
                component: () => import('@/views/recipe/RecipesOverviewPage.vue'),
            },
            {
                path: 'recipe/:id',
                component: () => import('@/views/recipe/RecipePage.vue'),
            },
            {
                path: 'shopping',
                component: () => import('@/views/ShoppingPage.vue'),
            },
            {
                path: 'login',
                component: () => import('@/views/LoginPage.vue')
            },
            {
                path: 'editor',
                component: () => import('@/views/editor/EditorPage.vue')
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

export default router
