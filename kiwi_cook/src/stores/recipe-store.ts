import { defineStore } from 'pinia';
import { Recipe } from 'src/models/recipe.ts';
import { computed, ref } from 'vue';
import { api } from 'boot/axios.ts';
import { searchRecipesByQuery } from 'src/utils/search.ts';

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

  const getRandomRecipe = () => recipes.value[Math.floor(Math.random() * recipes.value.length)];
  const searchRecipe = (query: string) => searchRecipesByQuery(recipeMap.value, query);

  // Fetch using axios
  api.get('/recipe/').then((r) => {
    recipes.value = r.data.response;
  });

  return {
    recipes,
    recipeMap,
    searchRecipe,
    getRandomRecipe,
  };
});
