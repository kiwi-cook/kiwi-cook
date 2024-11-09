<template>
  <q-card class="recipe-card apple-recipe-card">
    <!-- Recipe Image with Gradient Overlay and Centered Title -->
    <q-img
      :src="recipe.image_url"
      :alt="getTranslation(recipe.name)"
      class="recipe-image"
    >
      <div class="recipe-title">
        {{ getTranslation(recipe.name) }}
      </div>
    </q-img>

    <!-- Recipe Details Section with Centered, Simple Icons and Text -->
    <q-card-section class="recipe-details-section">
      <div class="recipe-details row items-center justify-around q-gutter-sm">
        <div class="recipe-detail-item">
          <q-icon name="schedule" size="md" color="grey-8"/>
          <span>{{ recipe.duration }} min</span>
        </div>
        <div class="recipe-detail-item">
          <q-icon name="fitness_center" size="md" color="grey-8"/>
          <span>{{ capitalize(recipe.difficulty) }}</span>
        </div>
        <div class="recipe-detail-item">
          <q-icon name="people" size="md" color="grey-8"/>
          <span>{{ recipe.servings }} servings</span>
        </div>
      </div>
    </q-card-section>

    <!-- Action Button with Subtle Accent -->
    <q-card-actions align="right" class="recipe-actions">
      <q-btn flat color="primary" :to="`/recipe/${recipe.id}`" class="view-button"
      >View Recipe
      </q-btn
      >
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { getTranslation, Recipe } from 'src/models/recipe';
import { capitalize, toRefs } from 'vue';

const props = defineProps<{
  recipe: Recipe;
}>();
const { recipe } = toRefs(props);
</script>

<style scoped lang="scss">
.apple-recipe-card {
  flex: 0 0 auto;
  width: 280px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }
}

.recipe-image {
  position: relative;
  height: 180px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.5));
  }
}

.recipe-title {
  position: relative;
  z-index: 1;
  font-size: 18px;
  color: white;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 10px;
  margin-bottom: 12px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.recipe-details-section {
  padding: 16px;
}

.recipe-detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 14px;
  color: $grey-8;

  q-icon {
    margin-bottom: 4px;
  }
}

.recipe-actions {
  padding: 16px;
}

.view-button {
  font-size: 16px;
  font-weight: 500;
  color: #0a84ff;
  padding: 6px 12px;
  border-radius: 8px;
  transition: color 0.2s;

  &:hover {
    color: #007aff;
  }
}
</style>
