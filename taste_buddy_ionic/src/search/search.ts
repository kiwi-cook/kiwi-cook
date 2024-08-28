/*
 * Copyright (c) 2024 Josef Müller.
 */

import Fuse, { IFuseOptions } from 'fuse.js';
import { stemmer } from 'stemmer';
import { useRecipeStore } from '@/app/storage';
import { logError } from '@/shared/utils/logging';
import { ERROR_MSG } from '@/shared/utils/errors.ts';
import { Ingredient, Recipe, RecipeSuggestion } from '@/models';

interface SearchableRecipe {
    id: string;
    name: string;
    description: string;
    ingredients: string[];
    tags: string[];
}

export class TasteBuddySearch {
    private fuse: Fuse<SearchableRecipe>;

    constructor(recipes?: Recipe[], ingredients?: Ingredient[]) {
        const searchableRecipes = this.prepareSearchableRecipes(recipes, ingredients);

        const options: IFuseOptions<SearchableRecipe> = {
            keys: [
                { name: 'name', weight: 0.3 },
                { name: 'description', weight: 0.2 },
                { name: 'ingredients', weight: 0.4 },
                { name: 'tags', weight: 0.1 }
            ],
            includeScore: true,
            threshold: 0.4,
            useExtendedSearch: true,
            ignoreLocation: true,
            findAllMatches: true,
        };

        this.fuse = new Fuse(searchableRecipes, options);
    }

    search(query: string): string[] {
        const processedTerms = this.processQuery(query);

        if (processedTerms.length === 0) {
            return [];
        }

        // Perform individual searches for each term
        const termResults = processedTerms.map(term =>
            new Set(this.fuse.search(term).map(result => result.item.id))
        );

        // Find the intersection of all term results
        const intersectionResults = termResults.reduce((acc, curr) =>
            new Set([...acc].filter(x => curr.has(x)))
        );

        return Array.from(intersectionResults);
    }

    private prepareSearchableRecipes(recipes?: Recipe[], ingredients?: Ingredient[]): SearchableRecipe[] {
        const searchableRecipes: SearchableRecipe[] = [];

        recipes?.forEach(recipe => {
            const searchableRecipe: SearchableRecipe = {
                id: recipe.id,
                name: this.processField(recipe.name.getAll()).join(' '),
                description: this.processField(recipe.description.getAll()).join(' '),
                ingredients: recipe.ingredients.flatMap(i => this.processField(i.ingredient.name.getAll())),
                tags: this.processField(recipe.getTags()),
            };
            searchableRecipes.push(searchableRecipe);
        });

        ingredients?.forEach(ingredient => {
            const searchableIngredient: SearchableRecipe = {
                id: ingredient.id,
                name: this.processField(ingredient.name.getAll()).join(' '),
                description: '',
                ingredients: [],
                tags: [],
            };
            searchableRecipes.push(searchableIngredient);
        });

        return searchableRecipes;
    }

    private processField(field: string[]): string[] {
        return field.flatMap(item =>
            item.toLowerCase().split(/\s+/).map(word => stemmer(word))
        );
    }

    private processQuery(query: string): string[] {
        // Split by any combination of spaces, commas, dots, semicolons, or other common separators
        const words = query.toLowerCase().split(/[\s,.;:!?]+/);

        if (words.length === 0) {
            return [];
        }

        // Remove empty strings and stem each word
        return words
            .filter(word => word.length > 0)
            .map(word => stemmer(word));
    }
}


export function searchRecipesByQuery(query: string): Promise<RecipeSuggestion[]> {
    return new Promise((resolve, reject) => {
        const store = useRecipeStore();
        const recipesAsMap = store.recipeMap;
        const recipeSearch = store.search;

        if (recipeSearch === null) {
            logError('searchRecipesByString', ERROR_MSG.isNull);
            reject(new Error('Recipe search is null'));
            return;
        }

        if (!(recipeSearch instanceof TasteBuddySearch)) {
            logError('searchRecipesByString', 'Invalid search instance');
            reject(new Error('Invalid search instance'));
            return;
        }

        try {
            const recipeIds = recipeSearch.search(query);
            const suggestions = recipeIds
                .map((recipeId: string) => recipesAsMap[recipeId])
                .filter((recipe): recipe is Recipe => recipe !== undefined)
                .map((recipe: Recipe) => {
                    const suggestion = new RecipeSuggestion(recipe);
                    suggestion.recipe_price = recipe.getPrice();
                    suggestion.missing_ingredients = [];
                    return suggestion;
                });
            resolve(suggestions);
        } catch (error) {
            logError('searchRecipesByString', 'Search failed', error);
            reject(error);
        }
    });
}
