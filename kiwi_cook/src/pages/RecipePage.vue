<template>
  <q-page v-if="recipe" class="container">
    <q-card class="recipe-card">
      <div class="header">
        <img
          v-if="recipe.image_url"
          :alt="getTranslation(recipe.name)"
          :src="recipe.image_url"
          class="hero-image"
        />
        <div class="recipe-details">
          <h1 class="recipe-title">{{ getTranslation(recipe.name) }}</h1>
          <p class="description">{{ getTranslation(recipe.description) }}</p>
          <div class="badge-container">
            <q-badge
              v-if="recipe.rating"
              :label="recipe.rating"
              class="badge"
              icon="star"
            />
            <q-badge
              v-if="recipe.difficulty"
              :label="recipe.difficulty"
              class="badge"
              icon="fitness_center"
            />
            <q-badge
              v-if="recipe.cuisine"
              :label="recipe.cuisine"
              class="badge"
              icon="restaurant"
            />
            <q-badge
              v-if="recipe.duration"
              :label="formattedDuration"
              class="badge"
              icon="schedule"
            />
            <q-badge
              v-if="recipe.servings"
              :label="formattedServings"
              class="badge"
              icon="people"
            />
            <q-badge
              :label="formattedNumberOfIngredients"
              class="badge"
              icon="local_dining"
            />
          </div>
        </div>
      </div>
      <q-slider
        v-model="servings"
        :max="recipe.servings * 2"
        :min="1"
        class="servings-slider"
      />
    </q-card>

    <!-- Recipe Content -->
    <div class="recipe-content">
      <!-- Ingredients Column -->
      <div class="ingredients-container">
        <h2 class="heading">{{ $t("recipe.ingredients") }}</h2>
        <q-list class="ingredients">
          <RecipeIngredient
            v-for="(ingredient, index) in recipe.ingredients"
            :key="index"
            v-model="checkedIngredients[index]"
            :ingredient="ingredient"
            :servings="servings"
          />
        </q-list>
      </div>
    </div>

    <!-- Steps Column -->
    <div class="steps-container">
      <h2 class="heading">{{ $t("recipe.directions") }}</h2>
      <div class="steps-scroll">
        <q-card
          v-for="(step, index) in recipe.steps"
          :key="index"
          class="step-card"
          :class="{ active: checkedIngredients.every((checked) => checked) }"
        >
          <div class="step-number">
            {{ $t("recipe.direction") }} {{ index + 1 }}
          </div>
          <div class="step-description">
            {{ getTranslation(step.description) }}
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { computed, ref, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { useRecipeStore } from 'src/stores/recipe-store';
import { storeToRefs } from 'pinia';
import { getTranslation } from 'src/models/recipe';
import RecipeIngredient from 'src/components/recipe/RecipeIngredient.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Recipe Data
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
const checkedIngredients = ref<boolean[]>([]);
const servings = ref(recipe.value?.servings ?? 1);

// Computed properties
const formattedDuration = computed(
  () => `${recipe.value?.duration} ${t('recipe.minutes', {
    count: recipe.value?.duration,
  })}`,
);
const formattedServings = computed(
  () => `${servings.value} ${t('recipe.servings', {
    count: servings.value,
  })}`,
);
// eslint-disable-next-line max-len
const formattedNumberOfIngredients = computed(
  () => `${recipe.value?.ingredients?.length ?? 0} ${t('recipe.ingredients', {
    count: recipe.value?.ingredients?.length ?? 0,
  })}`,
);

// Lifecycle
watchEffect(() => {
  if (recipe.value) {
    checkedIngredients.value = recipe?.value?.ingredients?.map(() => false) ?? [];
    servings.value = recipe.value.servings;
  }
});
</script>

<style lang="scss" scoped>
.container {
  padding: 40px;
  max-width: 1200px;
  margin: auto;
}

.ingredients-container,
.steps-container {
  flex: 1;
}

.content-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;

  @media (min-width: 800px) {
    flex-wrap: nowrap;
  }
}

.steps-scroll {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  gap: 16px;
  padding-bottom: 12px;

  &::-webkit-scrollbar {
    display: none; /* Hide scrollbar */
  }
}

.step-card {
  flex: 0 0 80%; /* Cards take 80% of the container width */
  scroll-snap-align: center;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background: white;
  transition: transform 0.3s ease, opacity 0.3s ease;

  /* Initial styles for inactive cards */
  /* filter: grayscale(1);
  opacity: 0.7;
  filter: blur(1px);
  scale: 0.95; */
}

.step-card.active {
  filter: none; /* Remove blur */
  opacity: 1; /* Fully visible active card */
  transform: scale(1); /* Full size */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); /* Stronger shadow */
}

.step-description {
  margin-top: 8px;
}

/* General container improvements */
.container {
  padding: 48px; /* Increased padding for spaciousness */
  margin: auto; /* Center container */
  max-width: 1200px; /* Limit container width */
}

/* Recipe card enhancements */
.recipe-card {
  display: flex;
  flex-direction: column;
  background: #ffffff; /* Keep the clean white background */
  padding: 2.5em; /* Slightly more padding */
  margin-top: 24px; /* Uniform margin above cards */
  border-radius: 16px; /* Slightly less pronounced rounding */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Softer shadow */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.recipe-card:hover {
  transform: translateY(-2px); /* Slight lift on hover */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); /* Stronger shadow on hover */
}

/* Header adjustments for better responsiveness */
.header {
  display: flex;
  flex-wrap: wrap; /* Enable wrapping for responsiveness */
  gap: 20px; /* Increased spacing between elements */
  align-items: flex-start; /* Align elements to the top */
}

/* Hero image with improved focus */
.hero-image {
  width: 240px; /* Increased width for emphasis */
  height: auto; /* Maintain aspect ratio */
  max-height: 300px;
  border-radius: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hero-image:hover {
  transform: scale(1.1); /* More noticeable zoom */
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

/* Typography improvements for titles and descriptions */
.recipe-title {
  font-size: 2.75em; /* Larger title for emphasis */
  font-weight: bold;
  margin: 0 0 0.75em; /* Added margin for separation */
}

.description {
  font-size: 1.2em;
  line-height: 1.6;
  margin-bottom: 24px;
}

/* Badge styles for consistency and clarity */
.badge-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px; /* Wider spacing between badges */
}

.badge {
  padding: 6px 12px; /* Uniform padding */
  font-size: 0.875em;
  border-radius: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
  transition: background-color 0.3s ease;
}

.badge:hover {
  background-color: rgba(0, 0, 0, 0.05); /* Highlight on hover */
}

/* Section headings for better distinction */
.heading {
  font-size: 1.75em; /* Increased size for better emphasis */
  font-weight: 600;
  margin-bottom: 16px;
}

/* Ingredients and directions list */
.ingredients,
.directions {
  margin-top: 16px;
  line-height: 1.6; /* Improved spacing for readability */
}

.directions .step-description {
  margin-left: 8px; /* Indent text for badges */
}

/* Slider updates */
.servings-slider {
  margin-top: 16px;
}
</style>
