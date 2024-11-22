<template>
  <q-page class="mobile-recipe-container" v-if="recipe">
    <div class="recipe-header">
      <div class="header-content">
        <!-- Stack image and content vertically on mobile -->
        <div class="content-wrapper">
          <!-- Image section with responsive sizing -->
          <div class="image-wrapper" v-if="recipe.image_url">
            <img :src="recipe.image_url" :alt="getTranslation(recipe.name)" class="recipe-image" loading="lazy" />
          </div>
          <!-- Recipe details with improved spacing -->
          <div class="recipe-details">
            <h1 class="recipe-title">{{ getTranslation(recipe.name) }}</h1>
            <span class="recipe-description">{{ getTranslation(recipe.description) }}</span>
            <!-- Display recipe meta information -->
            <div class="recipe-meta">
              <div class="meta-item" v-for="(item, index) in metaItems" :key="index">
                <span class="meta-icon">{{ item.icon }}</span>
                <span class="meta-value">{{ item.value }}</span>
              </div>
            </div>
            <!-- Button -->
            <q-btn v-if="!summary" :label="$t('llm.summarize')" color="primary" class="q-mt-md"
              :loading="!summaryFinished" @click="summarizeRecipe">
              <template v-slot:loading>
                <q-spinner-grid />
              </template>
              <q-icon name="mdi-creation" class="q-mr-sm" />
            </q-btn>

            <!-- Summary -->
            <div v-if="summaryFinished && summary">
              <div class="recipe-summary-container">
                <q-icon name="mdi-lightbulb-on-outline" class="icon" />
                <div v-html="summary" class="recipe-summary" />
              </div>
              <!-- Disclaimer -->
              <div class="text-caption q-mt-sm">
                {{ $t('llm.disclaimer') }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <q-tabs v-model="activeTab" dense class="recipe-tabs" active-color="primary">
      <q-tab name="ingredients" icon="local_dining" label="Ingredients" />
      <q-tab name="steps" icon="list" label="Steps" />
    </q-tabs>

    <div v-if="activeTab === 'ingredients'" class="ingredients-section">
      <div class="servings-control">
        <label class="servings-label">Adjust Servings</label>
        <q-slider v-model="servings" :min="1" :max="recipe.servings * 2" color="primary" track-color="grey-3"
          class="servings-slider" />
      </div>

      <q-list class="ingredients-list">
        <RecipeIngredient v-for="(ingredient, index) in recipe.ingredients" :key="index"
          v-model="checkedIngredients[index]" :ingredient="ingredient" :servings="servings" />
      </q-list>
    </div>

    <div v-if="activeTab === 'steps'" class="steps-container">
      <q-card v-for="(step, index) in recipeSteps" :key="index" class="step-card">
        <q-card-section>
          <div class="step-header">
            <div class="step-number">{{ $t("recipe.direction") }} {{ index + 1 }}</div>
          </div>
          <div class="step-description">
            <div v-html="step" />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import {
  getTranslation,
  RecipeIngredient as Ingredient,
  RecipeStep,
} from 'src/models/recipe';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useRecipeStore } from 'src/stores/recipe-store';
import { useRoute } from 'vue-router';
import RecipeIngredient from 'src/components/recipe/RecipeIngredient.vue';
import { useLlm } from 'src/composables/llm/useLlm';

const { t } = useI18n();

const activeTab = ref('ingredients');
const route = useRoute();
const recipeStore = useRecipeStore();
const { recipeMap } = storeToRefs(recipeStore);

const recipe = computed(() => {
  let recipeId = route.params.id;
  if (Array.isArray(recipeId)) {
    [recipeId] = recipeId;
  }
  return recipeMap.value.get(recipeId);
});
/* Ingredients */
const recipeIngredients = computed(() => (recipe.value?.ingredients ?? [])
  .map((ingredient: Ingredient) => getTranslation(ingredient.ingredient.name)));

/* Steps */
const recipeSteps = computed(() => (recipe.value?.steps ?? []).map((step: RecipeStep) => highlightIngredients(
  getTranslation(step.description),
  recipeIngredients.value,
)));

/* Servings */
const servings = ref(recipe.value?.servings ?? 1);
const checkedIngredients = ref(
  recipe?.value?.ingredients?.map(() => false) ?? [],
);

/* Summary */
const summaryTransformer = useLlm('summarization');
const summaryFinished = computed(() => !summaryTransformer.isRunning.value);
const summary = computed(() => {
  const data = summaryTransformer.data.value as
    | { summary_text: string }[]
    | undefined;
  if (!data || data.length === 0) return '';
  let summaryText = data[0].summary_text;

  // Trim excessive spaces and dots at the beginning or end
  summaryText = summaryText.replace(/^\.+|\.+$/g, '').trim();

  // Replace consecutive dots with a single dot
  summaryText = summaryText.replace(/\.{2,}/g, '.');

  // Ensure there's no unnecessary whitespace around the summary
  summaryText = summaryText.replace(/\s+/g, ' ').trim();

  // Capitalize the first letter after every period
  summaryText = summaryText.replace(/(\.|!|\?)(\s*)([a-z])/g, (_, p1, p2, p3) => p1 + p2 + p3.toUpperCase());

  // Add a period at the end if not already present
  if (summaryText[summaryText.length - 1] !== '.') {
    summaryText += '.';
  }

  return summaryText;
});

function summarizeRecipe() {
  let text = '';

  // Add recipe name to the summarization
  const recipeName = getTranslation(recipe.value?.name);
  if (recipeName) {
    text += `${recipeName} is a great recipe. `;
  }

  // Add meta information
  const duration = recipe.value?.duration;
  const servingsCount = servings.value;
  if (duration && servingsCount) {
    text += `The recipe takes ${duration} minutes to prepare and serves ${servingsCount} people. `;
  }

  // Add steps
  const stepsText = recipe.value?.steps
    ?.map((step: RecipeStep) => getTranslation(step.description) ?? '')
    .filter(Boolean)
    .join(' ') ?? '';
  if (stepsText) {
    text += `For the steps, ${stepsText}.`;
  }

  // Cut the text to 800 characters
  text = text.slice(0, 800);
  console.log('Summarizing:', text);

  // Execute the summarization process
  summaryTransformer.exec(text);
}

/* Meta items */
const metaItems = computed(() => {
  if (!recipe.value) return [];
  return [
    {
      icon: '⏱️',
      value: `${recipe.value.duration} ${t('recipe.minutes', {
        count: recipe.value.duration,
      })}`,
    },
    {
      icon: '👥',
      value: `${servings.value} servings`,
    },
    ...(recipe?.value?.props.tags?.map((tag: string) => ({
      icon: '🏷️',
      value: tag,
    })) ?? []),
  ];
});

function highlightIngredients(text: string, ingredientNames: string[]) {
  // Remove numbers from the text
  const cleanedText = text.trim();

  // Tokenize ingredients into searchable words (split by spaces, and escape regex characters)
  const tokens = ingredientNames
    .flatMap((ingredient) => ingredient.split(/\s+/)) // Split ingredients into words
    .map((token) => token.replace(/[.*+?^${}()|[\]\\\d+]/g, '\\$&')); // Escape special characters in tokens

  // Create a regular expression to match the tokens
  const regex = new RegExp(tokens.join('|'), 'gi');

  // Highlight the matches in the cleaned text
  return cleanedText.replace(
    regex,
    (match) => `<span class="highlight">${match}</span>`,
  );
}
</script>

<style lang="scss">
.highlight {
  background-color: $primary;
  color: white;
  font-weight: bold;
}

.highlight::selection {
  background-color: $primary;
  color: white;
}
</style>

<style lang="scss" scoped>
.mobile-recipe-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;

  @media (max-width: 480px) {
    padding: 12px;
  }
}

.recipe-header {
  border-radius: 16px;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
  overflow: hidden;
  transition: all 0.3s ease;

  @media (max-width: 480px) {
    border-radius: 12px;
    margin-bottom: 16px;
  }
}

.header-content {
  padding: 16px;

  @media (max-width: 480px) {
    padding: 12px;
  }
}

.content-wrapper {
  display: flex;
  gap: 20px;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 16px;
  }
}

.image-wrapper {
  flex: 0 0 150px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);

  @media (max-width: 640px) {
    flex: none;
    width: 100%;
    height: 200px;
  }
}

.recipe-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recipe-details {
  flex: 1;
  min-width: 0; // Prevents flex item from overflowing
}

.recipe-title {
  font-family: "Georgia", "Times New Roman", serif;
  font-size: clamp(1.2em, 4vw, 1.6em);
  font-weight: 600;
  color: $grey-9;
  line-height: 1.3;
  margin-bottom: 8px;
  word-wrap: break-word;
  hyphens: auto;
}

.recipe-description {
  color: $grey-7;
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
  color: $grey-7;
  font-size: clamp(0.8em, 2.5vw, 0.95em);
}

.servings-control {
  margin-bottom: 20px;
  padding: 0 16px;
}

.servings-label {
  display: block;
  margin-bottom: 10px;
  color: $grey-7;
  font-weight: 600;
}

.steps-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  padding: 0 16px;
}

.step-card {
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &.step-completed {
    opacity: 0.7;
  }
}

.step-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.step-number {
  font-weight: bold;
  color: $grey-7;
  opacity: 0.7;
}

.step-description {
  line-height: 1.6;
  color: $grey-7;
}

.body--dark {
  .recipe-header {
    background-color: $dark;
  }

  .recipe-title {
    color: $grey-1;
  }

  .recipe-description {
    color: $grey-3;
  }

  .meta-item {
    color: $grey-3;
  }

  .servings-label {
    color: $grey-3;
  }

  .step-card {
    background-color: $dark;
    color: $grey-3;
  }

  .step-number {
    color: white;
  }

  .step-description {
    color: $grey-5;
  }
}
</style>
