import type { RecipeType } from 'src/models/recipe'

export interface MealPlan {
  date: Date
  meals: Meal[]
}

export interface Meal {
  mealType: 'breakfast' | 'lunch' | 'dinner'
  recipe: RecipeType
  reason?: string
}
