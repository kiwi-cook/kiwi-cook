import { defineStore } from 'pinia';
import { getTranslation, Recipe } from 'src/models/recipe.ts';
import { computed, ref } from 'vue';
import { api } from 'boot/axios.ts';
import { useRecipeSearch } from 'src/composables/useSearch.ts';
import { UserPreferences } from 'src/models/user.ts';
import { useAnalytics } from 'src/composables/useAnalytics.ts';
import { useLlm } from 'src/composables/llm/useLlm.ts';

export const useRecipeStore = defineStore('recipe', () => {
  const { trackEvent } = useAnalytics();
  const summarizer = useLlm('summarize');

  let fetchPromise: Promise<void> | null = null;
  const recipes = ref<Recipe[]>([]);

  const recipeMap = computed(() => {
    const map = new Map<string, Recipe>();
    recipes.value.forEach((recipe: Recipe) => {
      // eslint-disable-next-line no-underscore-dangle
      map.set(recipe.id.toString(), recipe);
    });
    return map;
  });
  const recipeSearch = useRecipeSearch();

  const getRandomRecipe = () => recipes.value[Math.floor(Math.random() * recipes.value.length)];
  const searchByQuery = (query: string) => recipeSearch.searchRecipesByQuery(recipeMap.value, query);
  const searchByPreferences = (preferences: UserPreferences) => recipeSearch.searchRecipesByPreferences(recipeMap.value, preferences);

  function fetchRecipes() {
    // Check if a request is already in progress
    if (fetchPromise) {
      trackEvent('fetchRecipes', { status: 'inProgress' });
      return fetchPromise ?? Promise.resolve();
    }

    fetchPromise = api.get('/recipe/')
      .then((r) => {
        recipes.value = r.data.response;
      })
      .catch((err) => {
        trackEvent('fetchRecipes', { status: 'error', error: err });
      })
      .finally(() => {
        fetchPromise = null;
      });

    return fetchPromise;
  }

  function summarizeRecipe(recipeId: string) {
    trackEvent('summarizeRecipe', { recipeId });
    const recipe = recipeMap.value.get(recipeId);
    if (!recipe || recipe.summary) {
      trackEvent('summarizeRecipe', { status: 'error', message: 'Recipe not found or already summarized' });
      return;
    }

    trackEvent('summarizeRecipe', { status: 'prepareCallback' });
    summarizer.ondatacallback.value = (data) => {
      recipe.summary = data as string;
    };

    trackEvent('summarizeRecipe', { status: 'prepareInstructions' });
    const instructions = `${recipe.steps.map((step) => getTranslation(step.description)).join('. ')}`;

    trackEvent('summarizeRecipe', { status: 'exec', instructions });
    summarizer.exec([instructions]);
  }

  fetchRecipes();

  return {
    recipes,
    recipeMap,
    fetchRecipes,
    searchByQuery,
    searchByPreferences,
    getRandomRecipe,
    summarizeRecipe,
  };
});
