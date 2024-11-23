import { RouteRecordRaw } from 'vue-router';
import IndexPage from 'pages/IndexPage.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'chat',
        component: IndexPage,
      },
      {
        path: 'recipe/:id',
        name: 'recipe',
        component: () => import('pages/RecipePage.vue'),
      },
      {
        path: 'login',
        name: 'login',
        component: () => import('pages/LoginPage.vue'),
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('pages/RegisterPage.vue'),
      },
    ],
  },

  // Always leave this as the last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    name: '404',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
