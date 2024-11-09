<template>
  <q-page v-if="recipe" class="container">
    <q-card class="recipe-card">
      <div class="header">
        <img v-if="recipe.image_url" :alt="getTranslation(recipe.name)" :src="recipe.image_url" class="hero-image"
             loading="eager"/>
        <div class="recipe-details">
          <h1 class="recipe-title">{{ getTranslation(recipe.name) }}</h1>
          <div class="recipe-info">
            <p class="description">{{ getTranslation(recipe.description) }}</p>
            <div class="badge-container">
              <q-badge v-if="recipe.rating" :label="recipe.rating" class="badge" icon="star"/>
              <q-badge v-if="recipe.difficulty" :label="recipe.difficulty" class="badge" icon="fitness_center"/>
              <q-badge v-if="recipe.cuisine" :label="recipe.cuisine" class="badge" icon="restaurant"/>
              <q-badge v-if="recipe.duration" :label="formattedDuration" class="badge" icon="schedule"/>
              <q-badge v-if="recipe.servings" :label="formattedServings" class="badge" icon="people"/>
              <q-badge :label="formattedNumberOfIngredients" class="badge" icon="local_dining"/>
              <template v-if="recipe.props.tags">
                <q-badge v-for="tag in recipe.props.tags" :key="tag" :label="tag" class="badge" color="secondary"
                         icon="local_offer"/>
              </template>
            </div>
          </div>
          <q-slider v-model="recipe.servings" :max="10" :min="1" class="servings-slider" @input="adjustServings"/>
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
                <q-list class="ingredients">
                  <RecipeIngredient
                    v-for="(ingredient, index) in recipe.ingredients"
                    :key="index"
                    v-model="checkedIngredients[index]"
                    :ingredient="ingredient"/>
                </q-list>
              </div>
              <div class="col-12 col-md-6">
                <h2 class="heading">{{ $t('recipe.steps') }}</h2>
                <q-list class="directions">
                  <q-item v-for="(step, index) in recipe.steps" :key="index">
                    <q-item-section>
                      <q-badge :label="index + 1" color="primary"/>
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

<script lang="ts" setup>
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

<style lang="scss" scoped>
.container {
  padding: 40px; /* Increased padding for a more spacious layout */
  margin: auto; /* Center container */
}

.recipe-card {
  display: flex;
  flex-direction: column;
  background: white; /* Maintain a clean white background */
  padding: 2em; /* Slightly increased padding */
  margin-top: 30px; /* Increased margin for better separation */
  border-radius: 20px; /* Unified border radius */
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
  transition: box-shadow 0.3s ease, transform 0.3s ease; /* Smooth transitions */
}

.header {
  display: flex;
  align-items: center; /* Center items vertically */
  gap: 16px; /* Space between child elements */

  @media (max-width: 600px) {
    flex-direction: column; /* Stack items on small screens */
    gap: 8px; /* Adjust space for stacked layout */
  }
}

.hero-image {
  width: 200px; /* Set fixed width for the image */
  height: auto; /* Maintain aspect ratio */
  max-height: 300px; /* Set maximum height for the image */
  border-radius: 12px; /* Soft rounded corners */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease; /* Transition effects */
}

.hero-image:hover {
  transform: scale(1.05); /* Slight zoom on hover */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); /* Stronger shadow on hover */
}

.recipe-details {
  flex-grow: 1;
  margin-top: 20px; /* Space above the details */
}

.recipe-title {
  font-size: 2.5em; /* Larger title for emphasis */
  font-weight: 600; /* Bold but refined */
  /* Remove default margins */
  color: #333; /* Darker color for better readability */
  line-height: 1.2; /* Slightly increased line height */
  margin: 0 0 0.5em;
}

.heading {
  font-size: 1.5em; /* Larger heading for sections */
  font-weight: 600; /* Bold for emphasis */
  color: #333; /* Darker color for headings */
  margin-bottom: 1em; /* Space below headings */
}

.recipe-info {
  margin-top: 5px; /* Space above the info */
  color: #666; /* Subtle color for secondary information */
}

.description {
  font-size: 1.1em; /* Slightly larger description */
  color: #444; /* Darker description text for contrast */
  line-height: 1.5; /* Improve readability */
  margin-bottom: 20px; /* Space below the description */
}

.badge-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px; /* Increased gap for badges */
  margin-bottom: 1em; /* Space below badge container */
}

.badge {
  padding: 5px 10px; /* Padding for badges */
  font-size: 0.875em; /* Consistent font size */
  border-radius: 12px; /* Rounded badges */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background 0.3s ease; /* Transition for hover effect */
}

.quick-info {
  margin-top: 1em; /* Space above quick info section */
  color: #888; /* Lighter color for quick info */
}

.ingredients, .directions {
  margin-top: 12px; /* Consistent spacing */
  line-height: 1.5; /* Improve readability */
}
</style>
