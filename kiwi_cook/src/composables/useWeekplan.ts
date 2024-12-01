import { useRecipeStore } from 'stores/recipe-store';
import type { Recipe, RecipeIngredient, UserIngredient } from 'src/models/recipe';
import {
  getTranslation,
} from 'src/models/recipe';
import type { Meal, MealPlan } from 'src/models/mealplan';

export function useWeekplan() {
  const recipeStore = useRecipeStore();

  function generateWeekplan(
    ingredients: UserIngredient[],
    options: {
      dietaryRestrictions?: string[];
      cuisinePreferences?: string[];
      days?: number;
    } = {},
  ): {
    mealPlans: MealPlan[];
    summary: {
      selectedRecipes: Recipe[];
      unusedIngredients: UserIngredient[];
      groceryList: { [category: string]: { name: string; quantity: number }[] };
    };
  } {
    const numberOfDays = options.days || 7;
    const mealTimes: ('breakfast' | 'lunch' | 'dinner')[] = ['breakfast', 'lunch', 'dinner'];
    const plan: MealPlan[] = [];
    const today = new Date();
    const selectedRecipes = new Set<string>();
    const unusedIngredients = new Set<UserIngredient>(ingredients);

    // Filter recipes based on user preferences
    const availableRecipes = recipeStore.recipes.filter((recipe) => {
      let matches = true;
      if (options.dietaryRestrictions && recipe.dietaryRestrictions) {
        matches &&= options.dietaryRestrictions.every((restriction) => recipe.dietaryRestrictions?.includes(restriction));
      }
      if (options.cuisinePreferences && recipe.cuisine) {
        matches &&= options.cuisinePreferences.includes(recipe.cuisine);
      }
      return matches;
    });

    // Sort ingredients by expiry date and handle undefined dates
    ingredients.sort((a, b) => {
      if (a.expiryDate === undefined) {
        return 1;
      }
      if (b.expiryDate === undefined) {
        return -1;
      }
      return a.expiryDate.getTime() - b.expiryDate.getTime(); // Regular sorting
    });

    for (let day = 0; day < numberOfDays; day++) {
      const date: Date = new Date(today.getTime() + day * 24 * 60 * 60 * 1000);
      const meals: Meal[] = mealTimes
        .map((mealType) => {
          // Select recipe that uses maximum available ingredients
          let bestRecipe: Recipe | null = null;
          let maxUsedIngredients = 0;

          for (let i = 0; i < availableRecipes.length; i++) {
            const recipe = availableRecipes[i];
            if (!recipe) {
              continue;
            }

            if (selectedRecipes.has(recipe.id) || recipe.deleted || !recipe.ingredients) {
              continue;
            }
            const usedIngredients = recipe.ingredients.filter((ri) => ingredients.some((ui) => ui.ingredient.name === ri.ingredient.name)).length;
            if (usedIngredients > maxUsedIngredients) {
              maxUsedIngredients = usedIngredients;
              bestRecipe = recipe;
            }
          }

          if (bestRecipe && bestRecipe.ingredients) {
            selectedRecipes.add(bestRecipe.id);
            bestRecipe.ingredients.forEach((ri) => {
              const ingredient = ingredients.find((ui) => ui.ingredient.name === ri.ingredient.name);

              // Remove used ingredients from the list
              if (ingredient) {
                unusedIngredients.delete(ingredient);
              }
            });
            return { mealType, recipe: bestRecipe };
          }
          // Fallback to any recipe
          const randomRecipe = availableRecipes.find((r) => !selectedRecipes.has(r.id));
          if (randomRecipe) {
            selectedRecipes.add(randomRecipe.id);
            return { mealType, recipe: randomRecipe };
          }
          return null;
        })
        .filter(Boolean) as Meal[];

      plan.push({ date, meals });
    }

    // Generate summary
    const selectedRecipesList = Array.from(selectedRecipes).map(
      (id) => recipeStore.recipes.find((r) => r.id === id)!,
    );
    const groceryList: { [category: string]: { name: string; quantity: number }[] } = {};

    selectedRecipesList.forEach((recipe) => {
      if (!recipe.ingredients) {
        return;
      }

      // Add ingredients to a grocery list
      recipe.ingredients.forEach((recipeIngredient: RecipeIngredient) => {
        const category = recipeIngredient.ingredient.category || 'Others';
        groceryList[category] = groceryList[category] || [];
        const item = groceryList[category].find((i) => i.name === getTranslation(recipeIngredient.ingredient.name));
        if (item) {
          item.quantity += recipeIngredient.quantity || 1;
        } else {
          groceryList[category].push({
            name: getTranslation(recipeIngredient.ingredient.name),
            quantity: recipeIngredient.quantity || 1,
          });
        }
      });
    });

    return {
      mealPlans: plan,
      summary: {
        selectedRecipes: selectedRecipesList,
        unusedIngredients: Array.from(unusedIngredients),
        groceryList,
      },
    };
  }

  function generateRandomWeekplan(days: number): MealPlan[] {
    const mealTypes: ('breakfast' | 'lunch' | 'dinner')[] = [
      'breakfast',
      'lunch',
      'dinner',
    ];
    const weekPlan: MealPlan[] = [];
    const usedRecipes = new Set<string>();

    for (let i = 0; i < days; i++) {
      const dayPlan: MealPlan = {
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        meals: [],
      };

      mealTypes.forEach((mealType) => {
        const randomRecipe = recipeStore.recipes[
          Math.floor(Math.random() * recipeStore.recipes.length)
        ];

        if (randomRecipe) {
          dayPlan.meals.push({
            mealType,
            recipe: randomRecipe,
          });

          usedRecipes.add(randomRecipe.id);
        }
      });

      weekPlan.push(dayPlan);
    }

    return weekPlan;
  }

  return {
    generateWeekplan,
    generateRandomWeekplan,
  };
}
