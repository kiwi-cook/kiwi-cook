/*
 * Copyright (c) 2024 Josef Müller.
 */

import { Recipe, RecipeIngredient } from '@/models/recipe.ts';

export class RecipeSuggestion {
    recipe: Recipe;
    recipe_price?: number;
    missing_ingredients?: {
        item: RecipeIngredient;
        price?: number;
    }[];

    constructor(recipe: Recipe) {
        this.recipe = recipe;
        this.recipe_price = 0;
        this.missing_ingredients = [];
    }

    public getMissingItems(): RecipeIngredient[] {
        return (
            this.missing_ingredients?.map(
                (missing_item) => missing_item.item ?? new RecipeIngredient()
            ) ?? []
        );
    }
}
