import {createRouter} from '@ionic/vue-router';
import {createWebHashHistory, Router, RouteRecordRaw} from 'vue-router';

// Pages
import TabsPage from '@/shared/views/VTabs.vue'
import VRecipe from "@/shared/views/VRecipe.vue";
import VRecipeSuggestions from "@/app/views/recipe/VRecipeSuggestions.vue";
import VRecipeOfTheDay from "@/app/views/recipe/VRecipeOfTheDay.vue";

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
            {
                name: 'RecipeSuggestions',
                path: 'recipe/suggestions',
                component: VRecipeSuggestions
            },
            {
                name: 'RecipeOfTheDay',
                path: 'recipe/of-the-day',
                component: VRecipeOfTheDay
            },
            {
                name: 'SavedRecipes',
                path: 'recipe/saved',
                component: () => import('@/app/views/recipe/VSavedRecipes.vue')
            },
            {
                name: 'Settings',
                path: 'settings',
                component: () => import('@/app/views/VSettings.vue')
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
    return createRouter({
        history: createWebHashHistory(process.env.BASE_URL),
        routes
    });
}
