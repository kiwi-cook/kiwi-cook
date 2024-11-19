import { route } from 'quasar/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import { useAnalytics } from 'src/composables/useAnalytics';
import { useRecipeStore } from 'stores/recipe-store.ts';
import { storeToRefs } from 'pinia';
import routes from './routes';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route((/* { store, ssrContext } */) => {
  const { trackEvent, trackPageView } = useAnalytics();

  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // Add a navigation guard to track page views
  Router.beforeEach(async (to, from, next) => {
    trackEvent('view_item', {
      content_type: 'page',
      content_id: to.path,
      item_id: to.params.id,
      content: to,
    });

    const recipeStore = useRecipeStore();
    const { recipeMap } = storeToRefs(recipeStore);

    // Check if the route is a recipe page
    if (to.name === 'recipe') {
      let recipeId = to.params.id;
      if (Array.isArray(recipeId)) {
        [recipeId] = recipeId;
      }
      // Fetch if the map is empty
      if (recipeMap.value.size === 0) {
        await recipeStore.fetchRecipes();
      }

      // Check if the recipe is already loaded
      if (!recipeMap.value.has(recipeId)) {
        // Go to 404
        next({ name: '404' });
      }
    }

    trackPageView(to.path);
    next();
  });

  return Router;
});
