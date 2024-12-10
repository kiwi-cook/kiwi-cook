<template>
  <q-card class="apple-recipe-card">
    <!-- Recipe Image with Gradient Overlay and Centered Title -->
    <q-img :src="image" :alt="recipe.name" class="recipe-image">
      <div class="recipe-title">
        {{ recipe.name }}
      </div>
    </q-img>

    <!-- Recipe Details Section with Centered, Simple Icons and Text -->
    <q-card-section class="recipe-details-section">
      <div class="row items-center justify-around q-gutter-sm">
        <div class="recipe-detail-item">
          <q-icon name="schedule" size="md" color="grey-8" />
          <span>{{ recipe.total_time }} min</span>
        </div>
        <div v-if="recipe.ingredients" class="recipe-detail-item">
          <q-icon name="local_dining" size="md" color="grey-8" />
          <span>{{ recipe.ingredients.length }} ingredients</span>
        </div>
        <div class="recipe-detail-item">
          <q-icon name="people" size="md" color="grey-8" />
          <span>{{ recipe.servings }} servings</span>
        </div>
      </div>
    </q-card-section>

    <!-- Action Button with Subtle Accent -->
    <q-card-actions align="right" class="recipe-actions">
      <q-btn flat color="primary" :to="`/recipe/${recipe.id}`" class="view-button">
        View Recipe
      </q-btn>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'

import type { RecipeType } from 'src/models/recipe'

const props = defineProps<{
  recipe: RecipeType
}>()
const { recipe } = toRefs(props)

const image = computed(() => {
  if (recipe.value?.image && recipe.value?.image?.length > 0) {
    return recipe.value.image[0] ?? ''
  }

  return ''
})
</script>

<style scoped lang="scss">
.apple-recipe-card {
  flex: 0 0 auto;
  width: 280px;
  border-radius: 24px;
  overflow: hidden;
  backdrop-filter: blur(12px);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  background: $bg-gradient;
}

.body--dark {
  .apple-recipe-card {
    background: $bg-gradient-dark;
    box-shadow: none;
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
  background: rgba(0, 0, 0, 0.6);
  margin-bottom: 12px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(51, 51, 51, 0.3);
  backdrop-filter: blur(2px);
}

.recipe-details-section {
  padding: 16px;
}

.recipe-detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 14px;

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
  padding: 6px 12px;
  border-radius: 8px;
  transition: color 0.2s;
}
</style>
