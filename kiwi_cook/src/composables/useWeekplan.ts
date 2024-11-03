import { useRecipeStore } from 'stores/recipe-store.ts';
import { getTranslation, Recipe, UserIngredient } from 'src/models/recipe.ts';
import { MealPlan } from 'src/models/mealplan.ts';

export function useWeekplan() {
  const recipeStore = useRecipeStore();

  function calculateIngredientUsageScore(recipe: Recipe, ingredients: UserIngredient[]): number {
    if (!recipe.ingredients) {
      return 0;
    }

    let score = 0;
    const availableIngredients = new Map(
      ingredients.map((ing: UserIngredient) => [getTranslation(ing.ingredient.name), ing]),
    );

    recipe.ingredients.forEach((recipeIng) => {
      const available = availableIngredients.get(getTranslation(recipeIng.ingredient.name));
      if (available) {
        // Higher score for ingredients closer to expiry
        const daysToExpiry = available.expiryDate ? Math.max(0, (available.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 7;

        score += (1 / (daysToExpiry + 1)) * 10;

        // Higher score for using more of the available ingredients
        const usageRatio = (recipeIng.quantity ?? 1) / available.quantity;
        score += usageRatio * 5;
      }
    });

    return score;
  }

  function findBestRecipeForMeal(
    mealType: 'breakfast' | 'lunch' | 'dinner',
    usedRecipes: Set<string>,
    ingredients: UserIngredient[],
  ): Recipe | null {
    return (
      recipeStore.recipes
        .filter(
          (recipe: Recipe) => recipe.props.mealType === mealType
            && !usedRecipes.has(getTranslation(recipe.name))
            && canMakeRecipe(recipe, ingredients),
        )
        .map((recipe) => ({
          recipe,
          score: calculateIngredientUsageScore(recipe, ingredients),
        }))
        .sort((a, b) => b.score - a.score)
        .map((item) => item.recipe)[0] || null
    );
  }

  function canMakeRecipe(recipe: Recipe, ingredients: UserIngredient[]): boolean {
    const availableIngredients = new Map(
      ingredients.map((ing) => [getTranslation(ing.ingredient.name), ing]),
    );

    if (!recipe.ingredients) {
      return false;
    }

    return recipe.ingredients.every((recipeIng) => {
      const available = availableIngredients.get(getTranslation(recipeIng.ingredient.name));
      return available && available.quantity >= (recipeIng.quantity ?? 1);
    });
  }

  function updateIngredients(recipe: Recipe, ingredients: UserIngredient[]): void {
    if (!recipe.ingredients) {
      return;
    }

    recipe.ingredients.forEach((recipeIng) => {
      const ingredientIndex = ingredients.findIndex(
        (ing) => getTranslation(ing.ingredient.name) === getTranslation(recipeIng.ingredient.name),
      );

      if (ingredientIndex !== -1) {
        ingredients[ingredientIndex].quantity -= recipeIng.quantity ?? 1;

        // Remove ingredient if fully used
        if (ingredients[ingredientIndex].quantity <= 0) {
          ingredients.splice(ingredientIndex, 1);
        }
      }
    });
  }

  function mapIngredientsToUserIngredients(ingredients: string[]): UserIngredient[] {
    return ingredients.map((ingredient) => ({
      ingredient: {
        name: {
          translations: {
            'en-US': ingredient,
          },
        },
        id: '',
      },
      quantity: 1,
      expiryDate: new Date(),
    } as UserIngredient));
  }

  function generateWeekPlan(days: number, ingredients: string[]): MealPlan[] {
    const mealTypes: ('breakfast' | 'lunch' | 'dinner')[] = [
      'breakfast',
      'lunch',
      'dinner',
    ];
    const weekPlan: MealPlan[] = [];
    const usedRecipes = new Set<string>();
    const userIngredients = mapIngredientsToUserIngredients(ingredients);

    for (let i = 0; i < days; i++) {
      const dayPlan: MealPlan = {
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        meals: [],
      };

      mealTypes.forEach((mealType) => {
        const bestRecipe = findBestRecipeForMeal(mealType, usedRecipes, userIngredients);

        if (bestRecipe) {
          dayPlan.meals.push({
            mealType,
            recipe: bestRecipe,
          });

          usedRecipes.add(bestRecipe.id);
          updateIngredients(bestRecipe, userIngredients);
        }
      });

      weekPlan.push(dayPlan);
    }

    return weekPlan;
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
        const randomRecipe = recipeStore.recipes[Math.floor(Math.random() * recipeStore.recipes.length)];

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
    generateWeekPlan,
    generateRandomWeekplan,
  };
}
