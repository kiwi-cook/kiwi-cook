import { defineStore } from 'pinia';
import { Recipe } from 'src/models/recipe.ts';
import { computed, ref } from 'vue';
import { api } from 'boot/axios.ts';
import { useRecipeSearch } from 'src/composables/useSearch.ts';
import { UserPreferences } from 'src/models/user.ts';

export const useRecipeStore = defineStore('recipe', () => {
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

  // Fetch using axios
  const fetchRecipes = () => api.get('/recipe/').then((r) => {
    recipes.value = r.data.response;
  });
  fetchRecipes();

  return {
    recipes,
    recipeMap,
    fetchRecipes,
    searchByQuery,
    searchByPreferences,
    getRandomRecipe,
  };
});
