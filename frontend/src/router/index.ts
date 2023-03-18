import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/tab1'
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/tab1'
      },
      {
        path: 'tab1',
        component: () => import('@/views/RecipeOfTheDayPage.vue')
      },
      {
        path: 'tab2',
        component: () => import('@/views/FridgePage.vue')
      },
      {
        path: 'tab3',
        component: () => import('@/views/SearchPage.vue')
      },
      {
        path: 'tab4',
        component: () => import('@/views/ShoppingPage.vue'),
      },
      {
        path: 'tab5',
        component: () => import('@/views/LoginPage.vue')
      },
      {
        path: 'editor',
        component: () => import('@/views/EditorPage.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
