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
  const fetchRecipes = () => api.get('/recipe/')
    .then((r) => {
      recipes.value = r.data.response;
    });

  function generateWeekplan(options: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
    days: number;
    ingredients: string[];

  }) {
    const weekplan: Recipe[] = [];
    const {
      breakfast, lunch, dinner, days,
    } = options;
    for (let i = 0; i < days; i++) {
      if (breakfast) {
        weekplan.push(getRandomRecipe());
      }
      if (lunch) {
        weekplan.push(getRandomRecipe());
      }
      if (dinner) {
        weekplan.push(getRandomRecipe());
      }
    }
    return weekplan;
  }

  fetchRecipes();

  return {
    recipes,
    recipeMap,
    generateWeekplan,
    fetchRecipes,
    searchByQuery,
    searchByPreferences,
    getRandomRecipe,
  };
});
