import { Recipe } from 'src/models/recipe.ts';

export interface MealPlan {
  date: Date;
  meals: Meal[];
}

export interface Meal {
  mealType: 'breakfast' | 'lunch' | 'dinner';
  recipe: Recipe;
}
