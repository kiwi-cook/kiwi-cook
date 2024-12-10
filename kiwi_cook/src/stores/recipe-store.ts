import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { api } from 'boot/axios'
import { useRecipeSearch } from 'src/composables/useSearch'
import type { UserPreferences } from 'src/models/user'
import { useAnalytics } from 'src/composables/useAnalytics'
import { useLlm } from 'src/composables/llm/useLlm'
import { formatName } from 'src/utils/string'
import type { RecipeType } from 'src/models/recipe'

export const useRecipeStore = defineStore('recipe', () => {
  const { trackEvent } = useAnalytics()
  const summarizer = useLlm('summarization')

  let fetchPromise: Promise<void> | null = null
  const recipes = ref<RecipeType[]>([])
  const ingredients = computed(() =>
    recipes.value
      .flatMap((recipe) => recipe.ingredients ?? [])
      .map((ingredient) => formatName(ingredient))
  )

  const recipeMap = computed(() => {
    const map = new Map<string, RecipeType>()
    recipes.value.forEach((recipe: RecipeType) => {
      map.set(recipe.id.toString(), recipe)
    })
    return map
  })
  const recipeSearch = useRecipeSearch()

  const getRandomRecipe = () => recipes.value[Math.floor(Math.random() * recipes.value.length)]
  const searchByQuery = (query: string) => recipeSearch.searchRecipesByQuery(recipeMap.value, query)
  const searchByPreferences = (preferences: UserPreferences) =>
    recipeSearch.searchRecipesByPreferences(recipeMap.value, preferences)

  function recipeIngredientByName(name: string): string | undefined {
    const formattedName = name.toLowerCase()
    return recipes.value
      .flatMap((recipe) => recipe.ingredients ?? [])
      .find((ingredient) => ingredient.toLowerCase().includes(formattedName))
  }

  function fetchRecipes() {
    // Check if a request is already in progress
    if (fetchPromise) {
      trackEvent('fetchRecipes', { status: 'inProgress' })
      return fetchPromise
    }

    fetchPromise = api
      .get('/recipe/')
      .then((response) => {
        const { data } = response
        if (data?.response) {
          recipes.value = data.response
          trackEvent('fetchRecipes', { status: 'success' })
        } else {
          throw new Error('Invalid response structure')
        }
      })
      .catch((error) => {
        const errorDetails = {
          message: error.message,
          code: error.code,
          response: error.response?.data,
        }
        trackEvent('fetchRecipes', { status: 'error', error: errorDetails })
      })
      .finally(() => {
        fetchPromise = null
      })

    return fetchPromise
  }

  function summarizeRecipe(recipeId: string) {
    trackEvent('summarizeRecipe', { recipeId })
    const recipe = recipeMap.value.get(recipeId)
    if (!recipe || recipe.summary) {
      trackEvent(
        'summarizeRecipe',
        {
          status: 'error',
          message: 'Recipe not found or already summarized',
        },
        false
      )
      return
    }

    trackEvent('summarizeRecipe', { status: 'prepareCallback' }, false)
    summarizer.ondatacallback.value = (data) => {
      recipe.summary = data as string
    }

    trackEvent('summarizeRecipe', { status: 'prepareInstructions' }, false)
    const instructions = `${recipe.instructions.map((step) => step).join('. ')}`

    trackEvent('summarizeRecipe', { status: 'exec', instructions }, false)
    summarizer.exec([instructions])
  }

  fetchRecipes()

  return {
    recipes,
    recipeMap,
    ingredients,
    fetchRecipes,
    searchByQuery,
    searchByPreferences,
    getRandomRecipe,
    summarizeRecipe,
    recipeIngredientByName,
  }
})
