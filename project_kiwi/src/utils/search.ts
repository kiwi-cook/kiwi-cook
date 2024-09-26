/*
 * Copyright (c) 2024 Josef Müller.
 */

import Fuse, { IFuseOptions } from 'fuse.js';
import { stemmer } from 'stemmer';
import { getAllTranslations, Recipe } from 'src/models/recipe.ts';

interface SearchableRecipe {
  id: string,
  name: string;
  ingredients?: string;
}

export class TasteBuddySearch {
  private fuse: Fuse<SearchableRecipe>;

  constructor(recipes: Recipe[]) {
    const searchableRecipes = TasteBuddySearch.prepareSearchableRecipes(recipes);

    const options: IFuseOptions<SearchableRecipe> = {
      keys: [
        { name: 'name', weight: 0.6 },
        { name: 'ingredients', weight: 0.4 },
      ],
      includeScore: true,
      threshold: 0.4,
      useExtendedSearch: true,
      ignoreLocation: true,
      findAllMatches: true,
    };

    this.fuse = new Fuse(searchableRecipes, options);
  }

  private static prepareSearchableRecipes(recipes?: Recipe[]): SearchableRecipe[] {
    const searchableRecipes: SearchableRecipe[] = [];

    recipes?.forEach((recipe) => {
      const searchableRecipe: SearchableRecipe = {
        // eslint-disable-next-line no-underscore-dangle
        id: recipe.id.toString(),
        name: TasteBuddySearch.processField(getAllTranslations(recipe.name)).join(' '),
        ingredients: recipe.ingredients?.map((ingredient) => TasteBuddySearch.processField(getAllTranslations(ingredient.ingredient.name))).join(' '), // eslint-disable-line max-len
      };
      searchableRecipes.push(searchableRecipe);
    });

    return searchableRecipes;
  }

  private static processField(field: string[]): string[] {
    return field.flatMap((item) => item
      .toLowerCase()
      .split(/\s+/)
      .map((word) => stemmer(word)));
  }

  private static processQuery(query: string): string[] {
    // Split by any combination of spaces, commas, dots, semicolons, or other common separators
    const words = query.toLowerCase().split(/[\s,.;:!?]+/);

    if (words.length === 0) {
      return [];
    }

    // Remove empty strings and stem each word
    return words
      .filter((word) => word.length > 0)
      .map((word) => stemmer(word));
  }

  search(query: string): string[] {
    const processedTerms = TasteBuddySearch.processQuery(query);

    if (processedTerms.length === 0) {
      return [];
    }

    // Perform individual searches for each term
    const termResults = processedTerms
      .map((term) => new Set(this.fuse
        .search(term)
        .map((result) => result.item.id)));

    // Find the intersection of all term results
    const intersectionResults = termResults
      .reduce((acc, curr) => new Set([...acc]
        .filter((x) => curr.has(x))));

    return Array.from(intersectionResults);
  }
}

export function searchRecipesByQuery(recipeMap: Map<string, Recipe>, query: string): Promise<Recipe[]> {
  return new Promise((resolve, reject) => {
    const recipeSearch = new TasteBuddySearch(Array.from(recipeMap.values()));

    if (recipeSearch === null) {
      reject(new Error('Recipe search is null'));
      return;
    }

    try {
      const recipeIds = recipeSearch.search(query);
      const searchedRecipes = recipeIds
        .map((recipeId: string) => recipeMap.get(recipeId))
        .filter((recipe): recipe is Recipe => recipe !== undefined);
      resolve(searchedRecipes);
    } catch (error) {
      reject(error);
    }
  });
}
