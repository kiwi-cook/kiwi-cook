/*
 * Copyright (c) 2024 Josef Müller.
 */

import { ref } from 'vue'
import type { IFuseOptions } from 'fuse.js'
import Fuse from 'fuse.js'
import { stemmer } from 'stemmer'

import type { Recipe } from 'src/models/recipe'
import { getAllTranslations } from 'src/models/recipe'
import type { UserPreferences } from 'src/models/user'
import { useAnalytics } from 'src/composables/useAnalytics'

interface SearchableRecipe {
  id: string
  name: string
  ingredients: string | undefined
}

interface UseRecipeSearch {
  searchRecipesByQuery: (recipeMap: Map<string, Recipe>, query: string) => Promise<Recipe[]>
  searchRecipesByPreferences: (
    recipeMap: Map<string, Recipe>,
    userPreferences: UserPreferences
  ) => Promise<Recipe[]>
}

export function useRecipeSearch(): UseRecipeSearch {
  const { trackEvent } = useAnalytics()

  const fuse = ref<Fuse<SearchableRecipe> | null>(null)

  const processField = (field: string[]): string[] =>
    field.flatMap((item) =>
      item
        .toLowerCase()
        .split(/\s+/)
        .map((word) => stemmer(word))
    )

  const prepareSearchableRecipes = (recipes?: Recipe[]): SearchableRecipe[] => {
    const searchableRecipes: SearchableRecipe[] = []

    recipes?.forEach((recipe) => {
      const searchableRecipe: SearchableRecipe = {
        id: recipe.id.toString(),
        name: processField(getAllTranslations(recipe.name)).join(' '),
        ingredients: recipe.ingredients
          ?.flatMap((ingredient) => processField(getAllTranslations(ingredient.ingredient.name)))
          .join(' '),
      }
      searchableRecipes.push(searchableRecipe)
    })

    return searchableRecipes
  }

  const processQuery = (query: string): string[] => {
    const words = query.toLowerCase().split(/[\s,.;:!?]+/)

    if (words.length === 0) {
      return []
    }

    return words.filter((word) => word.length > 0).map((word) => stemmer(word))
  }

  const initializeFuse = (recipes: Recipe[]) => {
    const searchableRecipes = prepareSearchableRecipes(recipes)

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
    }

    fuse.value = new Fuse(searchableRecipes, options)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const filterRecipeByDietaryRestrictions = (): boolean => true

  /* const dietaryRestrictions = userPreferences.dietaryRestrictions ?? [];

    // Combine tags and dietary restrictions
    const recipeDietaryRestrictions: Set<string> = new Set(...recipe.props.tags ?? [], ...recipe.props.dietaryRestrictions ?? []);


    return dietaryRestrictions.every((restriction: string) => recipeDietaryRestrictions.has(restriction)); */

  const filterRecipeByDuration = (recipe: Recipe, userPreferences: UserPreferences): boolean => {
    const maxDuration = userPreferences.cookingTime
    if (maxDuration === undefined) {
      return true
    }
    trackEvent('filterRecipeByDuration', { recipeDuration: recipe.duration, maxDuration })
    return recipe.duration <= maxDuration
  }

  function filterRecipeByTag(recipe: Recipe, userPreferences: UserPreferences): boolean {
    const tags = userPreferences.tags ?? []

    const recipeTags = recipe.props.tags ?? []
    if (recipeTags.length === 0 || tags.length === 0) {
      return true
    }
    trackEvent('filterRecipeByDuration', { recipeTags, tags })
    return tags.some((tag: string) => recipeTags.includes(tag))
  }

  const search = (query: string): string[] => {
    if (!fuse.value) {
      return []
    }

    const processedTerms = processQuery(query)

    if (processedTerms.length === 0) {
      return []
    }

    const termResults = processedTerms.map(
      (term) => new Set(fuse.value!.search(term).map((result) => result.item.id))
    )

    const intersectionResults = termResults.reduce(
      (acc, curr) => new Set([...acc].filter((x) => curr.has(x)))
    )

    return Array.from(intersectionResults)
  }

  const searchRecipesByQuery = async (
    recipeMap: Map<string, Recipe>,
    query: string
  ): Promise<Recipe[]> =>
    new Promise((resolve, reject) => {
      try {
        initializeFuse(Array.from(recipeMap.values()))
        const recipeIds = search(query)
        const searchedRecipes = recipeIds
          .map((recipeId: string) => recipeMap.get(recipeId))
          .filter((recipe): recipe is Recipe => recipe !== undefined)
        resolve(searchedRecipes)
      } catch (error) {
        reject(error)
      }
    })

  const searchRecipesByPreferences = async (
    recipeMap: Map<string, Recipe>,
    userPreferences: UserPreferences
  ): Promise<Recipe[]> =>
    new Promise((resolve, reject) => {
      trackEvent('searchRecipesByPreferences', { userPreferences })

      const recipes = Array.from(recipeMap.values())
      if (!recipes || userPreferences === undefined) {
        reject(new Error('No recipes found.'))
      }

      const filters = [
        filterRecipeByDuration,
        filterRecipeByDietaryRestrictions,
        // filterRecipeBySkillLevel,
        // filterRecipeByCuisine,
        filterRecipeByTag,
      ]

      const filteredRecipes = recipes.filter((recipe) =>
        filters.every((filter) => filter(recipe, userPreferences))
      )
      resolve(filteredRecipes)
    })

  return {
    searchRecipesByQuery,
    searchRecipesByPreferences,
  }
}
