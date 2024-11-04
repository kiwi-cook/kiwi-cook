<template>
  <q-card class="recipe-card">
    <q-img
      :src="recipe.image_url"
      :alt="getTranslation(recipe.name)"
      class="recipe-image"
    >
      <div class="recipe-title q-pa-sm">
        {{ getTranslation(recipe.name) }}
      </div>
    </q-img>

    <q-card-section class="q-pt-md">
      <div class="recipe-details row items-center justify-between q-gutter-sm">
        <div class="col-auto">
          <q-icon name="schedule" color="primary" size="xs" />
          {{ recipe.duration }} min
        </div>
        <div class="col-auto">
          <q-icon name="fitness_center" color="primary" size="xs" />
          {{ capitalize(recipe.difficulty) }}
        </div>
        <div class="col-auto">
          <q-icon name="people" color="primary" size="xs" />
          {{ recipe.servings }} servings
        </div>
      </div>
    </q-card-section>

    <q-card-actions align="right" class="q-mt-auto">
      <!-- View Recipe -->
      <q-btn flat color="primary" :to="`/recipe/${recipe.id}`"
        >View Recipe</q-btn
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
.recipe-card {
  flex: 0 0 auto;
  width: 280px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
}

.recipe-title {
  background: rgba(0, 0, 0, 0.6);
}
</style>
