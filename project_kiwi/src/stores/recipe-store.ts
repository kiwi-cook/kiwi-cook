import { defineStore } from 'pinia';
import { Recipe } from 'src/models/recipe.ts';
import { ref } from 'vue';
import { api } from 'boot/axios.ts';

export const useRecipeStore = defineStore('recipe', () => {
  const recipes = ref<Recipe[]>([]);

  const getRandomRecipe = () => recipes.value[Math.floor(Math.random() * recipes.value.length)];

  // Fetch using axios
  api.get('/recipe/').then((r) => {
    recipes.value = r.data.response;
  });

  return {
    recipes,
    getRandomRecipe,
  };
});
