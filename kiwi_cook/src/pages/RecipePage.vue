<template>
  <q-page v-if="recipe" class="recipe-container">
    <!-- Header Section -->
    <div class="recipe-header">
      <div class="header-content">
        <div class="content-wrapper">
          <!-- Image section -->
          <div v-if="recipe.image_url" class="image-wrapper">
            <img
              :src="recipe.image_url"
              :alt="getTranslation(recipe.name)"
              class="recipe-image"
              loading="lazy"
            />
          </div>
          <!-- Recipe details -->
          <div class="recipe-details">
            <h1 class="recipe-title">
              {{ getTranslation(recipe.name) }}
            </h1>
            <span class="recipe-description">{{ getTranslation(recipe.description) }}</span>

            <!-- Meta information -->
            <div class="recipe-meta">
              <div v-for="(item, index) in metaItems" :key="index" class="meta-item">
                <span class="meta-icon">{{ item.icon }}</span>
                <span class="meta-value">{{ item.value }}</span>
              </div>
            </div>

            <!-- Action buttons -->
            <div class="q-mt-md">
              <q-btn
                color="primary"
                class="q-mr-sm"
                icon="share"
                :label="$t('recipe.share')"
                @click="shareRecipe"
              />
            </div>

            <!-- LLM Summary -->
            <div class="llm-section">
              <LlmButton
                class="recipe-summary-button q-mt-md"
                task-type="summarization"
                :input="summaryInput"
                :button-text="$t('llm.summarize')"
                icon="mdi-creation"
                @on-output="summaryOutput = $event"
              />
              <LlmButton
                class="recipe-summary-button q-mt-md"
                task-type="translation"
                :input="translationInput"
                :button-text="$t('llm.translate')"
                icon="mdi-translate"
                @on-output="translationOutput = $event"
              />
            </div>

            <div v-if="summaryOutput" class="summary-section">
              <div class="recipe-summary-container">
                <q-icon name="mdi-lightbulb-on-outline" class="icon" />
                <div class="recipe-summary" v-html="summaryOutput" />
              </div>
              <div class="text-caption q-mt-sm">
                {{ $t('llm.disclaimer') }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Section -->
    <div class="recipe-content">
      <!-- Ingredients Section -->
      <div class="ingredients-section">
        <h2 class="section-title">
          {{ recipe.ingredients?.length ?? 0 }}
          {{
            $t('recipe.ingredients', {
              count: recipe.ingredients?.length ?? 0,
            })
          }}
        </h2>
        <div class="servings-control">
          <label class="servings-label">{{ $t('recipe.adjustServings') }}</label>
          <q-slider
            v-model="servings"
            :min="1"
            :max="recipe.servings * 2"
            color="primary"
            track-color="grey-3"
            class="servings-slider"
            :label-value="`${servings} ${$t('recipe.servings', { count: servings })}`"
            label-always
          />
        </div>
        <q-list class="ingredients-list">
          <RecipeIngredient
            v-for="(ingredient, index) in recipe.ingredients"
            :key="index"
            :ingredient="ingredient"
            :servings="servings"
          />
        </q-list>
      </div>

      <!-- Steps Section -->
      <div class="steps-section">
        <h2 class="section-title">
          {{ recipe.steps?.length ?? 0 }}
          {{
            $t('recipe.directions', {
              count: recipe.steps?.length ?? 0,
            })
          }}
        </h2>
        <div class="steps-container">
          <q-card v-for="(step, index) in recipeSteps" :key="index" class="step-card">
            <q-card-section>
              <div class="step-header">
                <div class="step-number">
                  {{ $t('recipe.directions', { count: 1 }) }} {{ index + 1 }}
                </div>
              </div>
              <div class="step-description">
                <div v-html="step" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'

import type { RecipeIngredient as Ingredient, RecipeStep } from 'src/models/recipe'
import { getTranslation } from 'src/models/recipe'
import { useRecipeStore } from 'src/stores/recipe-store'
import RecipeIngredient from 'src/components/recipe/RecipeIngredient.vue'
import LlmButton from 'src/components/LlmButton.vue'

const { t, locale } = useI18n()

const route = useRoute()
const recipeStore = useRecipeStore()
const { recipeMap } = storeToRefs(recipeStore)

const recipe = computed(() => {
  let recipeId = route.params.id
  if (Array.isArray(recipeId)) {
    ;[recipeId] = recipeId
  }
  return recipeId ? recipeMap.value.get(recipeId) : undefined
})
/* Ingredients */
const recipeIngredients = computed(() =>
  (recipe.value?.ingredients ?? []).map((ingredient: Ingredient) =>
    getTranslation(ingredient.ingredient.name)
  )
)

/* Servings */
const servings = ref(recipe.value?.servings ?? 1)

/* Share */
function shareRecipe() {
  const recipeName = getTranslation(recipe.value?.name)
  const recipeUrl = window.location.href
  navigator.share({
    title: recipeName,
    text: recipeName,
    url: recipeUrl,
  })
}

/* Favorite */
// TODO: Implement favorite functionality

/* Summary */
const summaryOutput = ref<unknown | null>(null)
const summaryInput = computed(() => {
  let text = ''

  // Add recipe name
  const recipeName = getTranslation(recipe.value?.name)
  if (recipeName) {
    text += `The recipe is called "${recipeName}". `
  }

  // Add meta information (duration and servings)
  const duration = recipe.value?.duration
  const servingsCount = servings.value
  if (duration || servingsCount) {
    text += 'Here are some details: '
    if (duration) text += `it takes about ${duration} minutes to prepare. `
    if (servingsCount) text += `This recipe serves ${servingsCount} people. `
  }

  // Add steps (optional)
  const stepsText =
    recipe.value?.steps
      ?.map((step: RecipeStep) => getTranslation(step.description) ?? '')
      .filter(Boolean)
      .join('. ') ?? ''
  if (stepsText) {
    text += `The steps to make this dish are as follows: ${stepsText}.`
  }
  return text
})

/* Translation */
const translationOutput = ref<unknown | null>(null)
const translationInput = computed(() => {
  const texts = []
  texts.push(getTranslation(recipe.value?.name))
  texts.push(getTranslation(recipe.value?.description))
  texts.push(
    ...(recipe.value?.ingredients ?? []).map((ingredient: Ingredient) =>
      getTranslation(ingredient.ingredient.name)
    )
  )
  texts.push(
    ...(recipe.value?.steps ?? []).map((step: RecipeStep) => getTranslation(step.description))
  )
  return {
    input: texts,
    sourceLanguage: recipe.value?.props?.language ?? 'en',
    targetLanguage: locale.value ?? 'de',
  }
})

/* Steps */
const recipeSteps = computed(() => {
  try {
    // Early return if recipe is missing
    if (!recipe.value) {
      return []
    }

    // Validate and extract steps
    const { steps } = recipe.value
    if (!Array.isArray(steps)) {
      return []
    }

    // Get translations safely
    const translations = Array.isArray(translationOutput.value) ? translationOutput.value : []

    return steps.map((step: RecipeStep, index: number) => {
      // Get translation with offset of 2 (assuming first 2 entries are metadata)
      const translationIndex = index + 2 + (recipe.value?.ingredients?.length ?? 0)
      const stepTranslation = translations[translationIndex]

      const description = stepTranslation ?? getTranslation(step.description)

      // Ensure we have recipe ingredients before highlighting
      const ingredients = recipeIngredients.value ?? []

      return highlightIngredients(description, ingredients)
    })
  } catch (error) {
    return []
  }
})

/* Meta items */
const metaItems = computed(() => {
  if (!recipe.value) return []
  return [
    {
      icon: '⏱️',
      value: `${recipe.value.duration} ${t('units.minutes', {
        count: recipe.value.duration,
      })}`,
    },
    {
      icon: '👥',
      value: `${servings.value} ${t('recipe.servings', {
        count: servings.value,
      })}`,
    },
    ...(recipe?.value?.props.tags?.map((tag: string) => ({
      icon: '🏷️',
      value: tag,
    })) ?? []),
  ]
})

function highlightIngredients(text: string, ingredientNames: string[]) {
  // Remove numbers from the text
  const cleanedText = text.trim()

  // Tokenize ingredients into searchable words (split by spaces, and escape regex characters)
  const tokens = ingredientNames
    .flatMap((ingredient) => ingredient.split(/\s+/)) // Split ingredients into words
    .map((token) => token.replace(/[.*+?^${}()|[\]\\\d+]/g, '\\$&')) // Escape special characters in tokens

  // Create a regular expression to match the tokens
  const regex = new RegExp(tokens.join('|'), 'gi')

  // Highlight the matches in the cleaned text
  return cleanedText.replace(regex, (match) => `<span class="highlight">${match}</span>`)
}
</script>

<style lang="scss">
.highlight {
  background-color: $primary;

  font-weight: bold;
}

.highlight::selection {
  background-color: $primary;
}
</style>

<style lang="scss" scoped>
.recipe-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px;

  @media (max-width: 480px) {
    padding: 12px;
  }
}

.recipe-header {
  background-color: $grey-1;
  border-radius: 16px;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
  overflow: hidden;

  @media (max-width: 480px) {
    border-radius: 12px;
    margin-bottom: 16px;
  }
}

.header-content {
  padding: 24px;

  @media (max-width: 480px) {
    padding: 16px;
  }
}

.content-wrapper {
  display: flex;
  gap: 32px;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 24px;
  }
}

.image-wrapper {
  flex: 0 0 300px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);

  @media (max-width: 640px) {
    flex: none;
    width: 100%;
    height: 250px;
  }
}

.recipe-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recipe-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;

  @media (min-width: 1024px) {
    grid-template-columns: minmax(300px, 1fr) 2fr;
    align-items: start;
  }
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.ingredients-section {
  background-color: $grey-1;
  border-radius: 16px;
  padding: 24px;
  height: fit-content;
}

.steps-section {
  background-color: $grey-1;
  border-radius: 16px;
  padding: 24px;
}

.servings-control {
  margin-bottom: 20px;
}

.servings-label {
  display: block;
  margin-bottom: 10px;

  font-weight: 600;
}

.steps-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.step-card {
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

// Dark mode styles
.body--dark {
  .recipe-header,
  .ingredients-section,
  .steps-section {
    background-color: $dark;
  }
}

.recipe-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: clamp(1.2em, 4vw, 1.6em);
  font-weight: 600;

  line-height: 1.3;
  margin-bottom: 8px;
  word-wrap: break-word;
  hyphens: auto;
}

.recipe-description {
  font-size: clamp(0.9em, 3vw, 1.1em);
  margin-bottom: 12px;
  display: -webkit-box;
  overflow: hidden;
}

.recipe-summary-container {
  display: flex;
  align-items: center;
  font-size: 10pt;
  line-height: 1.6;

  .icon {
    margin-right: 8px;
  }

  .recipe-summary {
    font-size: clamp(1em, 4vw, 1.3em);
    margin-top: 16px;
    font-style: italic;
    /* Cursive */
    letter-spacing: 0.5px;
    /* Slight letter spacing */
  }
}

.recipe-meta {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;

  @media (max-width: 480px) {
    gap: 10px;
  }
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;

  font-size: clamp(0.8em, 2.5vw, 0.95em);
}
</style>
