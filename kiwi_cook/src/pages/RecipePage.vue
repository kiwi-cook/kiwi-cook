<template>
  <q-page class="container" v-if="recipe">
    <q-card class="recipe-card">
      <div class="header">
        <img :src="recipe.image_url" :alt="getTranslation(recipe.name)" class="hero-image" loading="eager"
             v-if="recipe.image_url"/>
        <div class="recipe-details">
          <h1 class="recipe-title">{{ getTranslation(recipe.name) }}</h1>
          <div class="recipe-info">
            <p class="description">{{ getTranslation(recipe.description) }}</p>
            <div class="badge-container">
              <q-badge v-if="recipe.rating" :label="recipe.rating" icon="star" class="badge"/>
              <q-badge v-if="recipe.difficulty" :label="recipe.difficulty" icon="fitness_center" class="badge"/>
              <q-badge v-if="recipe.cuisine" :label="recipe.cuisine" icon="restaurant" class="badge"/>
              <q-badge v-if="recipe.duration" :label="formattedDuration" icon="schedule" class="badge"/>
              <q-badge v-if="recipe.servings" :label="formattedServings" icon="people" class="badge"/>
              <q-badge :label="formattedNumberOfIngredients" icon="local_dining" class="badge"/>
              <template v-if="recipe.props.tags">
                <q-badge :label="tag" v-for="tag in recipe.props.tags" icon="local_offer" class="badge" :key="tag"
                         color="secondary"/>
              </template>
            </div>
          </div>
          <q-slider v-model="recipe.servings" :min="1" :max="10" @input="adjustServings" class="servings-slider"/>
        </div>
      </div>
    </q-card>

    <aside class="recipe-content">
      <q-card class="recipe-card">
        <q-card-section>
          <q-layout>
            <div class="q-gutter-md row">
              <div class="col-12 col-md-6">
                <h2 class="heading">{{ $t('recipe.ingredients') }}</h2>
                <q-list bordered class="ingredients">
                  <RecipeIngredient
                    v-for="(ingredient, index) in recipe.ingredients"
                    :key="index"
                    :ingredient="ingredient"
                    v-model="checkedIngredients[index]"/>
                </q-list>
              </div>
              <div class="col-12 col-md-6">
                <h2 class="heading">{{ $t('recipe.steps') }}</h2>
                <q-list bordered class="directions">
                  <q-item v-for="(step, index) in recipe.steps" :key="index">
                    <q-item-section>
                      <q-badge color="primary" :label="index + 1"/>
                      <p class="step-description">{{ getTranslation(step.description) }}</p>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>
          </q-layout>
        </q-card-section>
      </q-card>
    </aside>
  </q-page>
</template>

<script setup lang="ts">
import {
  computed, onMounted, onUnmounted, ref, watch,
} from 'vue';
import { useRoute } from 'vue-router';
import { useRecipeStore } from 'stores/recipe-store';
import { storeToRefs } from 'pinia';
import { adjustRecipeServings, getTranslation, Recipe } from 'src/models/recipe';
import { useI18n } from 'vue-i18n';
import RecipeIngredient from 'components/recipe/RecipeIngredient.vue';

// State management
const route = useRoute();
const recipeStore = useRecipeStore();
const { recipeMap } = storeToRefs(recipeStore);
const recipeId = ref<string | undefined>();
const recipe = ref<Recipe | undefined>(undefined);
const checkedIngredients = ref<boolean[]>([]);

// Watchers
watch(() => route.params.id, async (id) => {
  if (Array.isArray(id)) {
    [id] = id;
  }
  recipeId.value = id;
}, { immediate: true });

watch([recipeId, recipeMap], ([id, map]) => {
  recipe.value = id && map ? map.get(id) : undefined;
}, { immediate: true });

const { t } = useI18n();

// Computed properties
const formattedDuration = computed(() => `${recipe.value?.duration} ${t('recipe.minutes', { count: recipe.value?.duration })}`);
const formattedServings = computed(() => `${recipe.value?.servings} ${t('recipe.servings', { count: recipe.value?.servings })}`);
const formattedNumberOfIngredients = computed(() => `${recipe.value?.ingredients?.length ?? 0}
${t('recipe.ingredients', { count: recipe.value?.ingredients?.length ?? 0 })}`);

// Adjust servings
const adjustServings = (change: number) => {
  if (recipe.value) {
    const newServings = recipe.value.servings + change;
    if (newServings >= 1) {
      recipe.value = adjustRecipeServings(recipe.value, newServings);
    }
  }
};

// Lifecycle hooks
onMounted(() => {
  // Initialize or start anything necessary
});

onUnmounted(() => {
  // Clean up if necessary
});
</script>

<style lang="scss">
.container {
  padding: 20px; // Maintain overall padding for clean layout
}

.recipe-card {
  display: flex;
  flex-direction: column;
  background: white; // Keep the card background white for clarity
  border-radius: 12px; // Soft corners
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5em; // Consistent padding
  margin-top: 20px; // Increased margin for separation
  transition: box-shadow 0.3s ease; // Transition for hover effect
  border: 2px solid var(--q-primary);
  border-bottom-left-radius: 0;
}

.header {
  display: flex;
  align-items: center;
}

.hero-image {
  width: 150px; /* Adjust size as needed */
  height: auto;
  margin-right: 20px; /* Space between image and text */
}

.recipe-details {
  flex-grow: 1;
}

.recipe-title {
  font-size: 1.5rem; /* Title size */
  margin: 0; /* Remove default margins */
}

.recipe-info {
  margin-top: 10px; /* Space above the info */
}

.description {
  font-size: 1rem; /* Description font size */
  margin-bottom: 10px; /* Space below the description */
}

.badge-container {
  display: flex;
  flex-wrap: wrap;
  gap: 5px; /* Space between badges */
}

.servings-slider {
  margin-top: 15px; /* Space above the slider */
}

.hero-image {
  width: 200px; /* Fixed width for large display */
  height: auto; /* Maintain aspect ratio */
  max-height: 200px; /* Set a maximum height */
  object-fit: cover; /* Ensure the image covers the area while preserving aspect ratio */
  margin-right: 20px; /* Space between image and text */
  border-radius: 12px; /* Rounded corners */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease; /* Transition for hover effect */
}

.hero-image:hover {
  transform: scale(1.02); // Slight zoom effect on hover
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); // Slightly stronger shadow on hover
}

.badge-container {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 1em; // Increased spacing for badges
}

.badge {
  margin-right: 8px; // Space between badges
  font-size: 0.875em; // Consistent font size for badges
  border-radius: 8px; // Rounded badges for a softer look
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background 0.3s ease; // Transition for hover effect
}

.recipe-title {
  font-size: 2em; // Large title for emphasis
  font-weight: 600; // Bold but not overly heavy
  margin-bottom: 0.5em; // Space below title
}

.quick-info {
  margin-top: 1em; // Add space above the quick info section
}

.ingredients, .directions {
  margin-top: 12px; // Consistent spacing
}
</style>
