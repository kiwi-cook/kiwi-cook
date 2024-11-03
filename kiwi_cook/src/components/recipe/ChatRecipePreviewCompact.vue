<template>
  <q-card class="recipe-card row no-wrap items-center q-pa-none">
    <q-img
      :src="recipe.image_url"
      :alt="getTranslation(recipe.name)"
      class="recipe-image"
    />

    <div class="recipe-info column q-px-sm">
      <div class="recipe-title text-bold">
        {{ getTranslation(recipe.name) }}
      </div>
      <div class="recipe-details row items-center q-mt-xs">
        <div class="detail-item">
          <q-icon name="schedule" color="primary" size="16px" />
          {{ recipe.duration }} min
        </div>
        <div class="detail-item q-ml-sm">
          <q-icon name="fitness_center" color="primary" size="16px" />
          {{ capitalize(recipe.difficulty) }}
        </div>
      </div>
      <q-btn flat dense color="primary" class="view-btn q-ml-none q-mt-xs" :to="`/recipe/${recipe.id}`">
        View Recipe
      </q-btn>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { getTranslation, Recipe } from 'src/models/recipe.ts';
import { capitalize } from 'vue';

defineProps<{
  recipe: Recipe;
}>();
</script>

<style scoped lang="scss">
.recipe-card {
  width: 100%;
  max-width: 360px;
  min-height: 80px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(6px);
  transition: transform 0.15s ease;

  &:hover {
    transform: translateY(-2px);
  }
}

.recipe-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
}

.recipe-info {
  flex: 1;
}

.recipe-title {
  font-size: 1rem;
  color: #333;
}

.recipe-details {
  font-size: 0.85rem;
  color: #666;
}

.detail-item {
  display: flex;
  align-items: center;
}

q-icon {
  margin-right: 4px;
}

.view-btn {
  font-size: 0.8rem;
  padding: 2px 6px;
  text-transform: none;
}
</style>
