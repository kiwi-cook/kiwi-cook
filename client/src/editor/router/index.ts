/*
 * Copyright (c) 2023 Josef Müller.
 */

import { createRouter } from '@ionic/vue-router';
import { createWebHashHistory, Router, RouteRecordRaw } from 'vue-router';

// Pages
import TabsPage from '@/editor/views/VTabs.vue'
import VHome from '@/editor/views/VHome.vue';
import VRecipe from '@/editor/views/recipe/VRecipe.vue';

const routes: Array<RouteRecordRaw> = [{
    name: 'Tabs', path: '/', component: TabsPage, redirect: () => ({name: 'Home'}), children: [{
        name: 'Home', path: 'home', component: VHome
    }, // Recipe
        {
            name: 'Recipe', path: 'recipe', component: VRecipe, redirect: () => ({name: 'RecipeList'}), children: [{
                name: 'RecipeList', path: 'list', component: () => import('@/editor/views/recipe/VRecipeList.vue'),
            }, {
                name: 'RecipeEditor',
                path: 'editor/:id',
                component: () => import('@/editor/views/recipe/VRecipeEditor.vue'),
            }, {
                name: 'RecipeJsonParser',
                path: 'parser/json',
                component: () => import('@/editor/views/recipe/parser/VRecipeJsonParser.vue'),
            }, {
                name: 'RecipeUrlParser',
                path: 'parser/url',
                component: () => import('@/editor/views/recipe/parser/VRecipeUrlParser.vue'),
            },]
        }, // Item
        {
            name: 'ItemEditor', path: 'item/editor', component: () => import('@/editor/views/item/VItemsEditor.vue'),
        }, // 404
        {
            name: 'NotFound', path: '/:pathMatch(.*)*', redirect: () => ({name: 'Home'}),
        }]
}]

/**
 * Create router
 * @returns {Router}
 */
export function createTasteBuddyRouter(): Router {
    return createRouter({
        history: createWebHashHistory(process.env.BASE_URL), routes
    });
}
