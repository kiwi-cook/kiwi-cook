<!-- IngredientsList.vue -->
<template>
  <q-list dark bordered separator>
    <q-item v-for="(ingredient, index) in customRecipe.ingredients" :key="index" clickable v-ripple>
      <q-item-section avatar>
        <q-avatar color="green-5" text-color="black">
          {{ index + 1 }}
        </q-avatar>
      </q-item-section>
      <q-item-section>
        <q-item-label :class="{ 'text-green-5': isIngredientHighlighted(ingredient) }">
          {{ getTranslation(ingredient.ingredient.name) }}
        </q-item-label>
        <q-item-label caption>{{ roundQuantity(ingredient.quantity) }} {{ ingredient.unit }}</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-checkbox v-model="(ingredient as any).checked" color="green-5"/>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { computed, defineProps, toRefs } from 'vue';
import { getTranslation, Recipe, RecipeIngredient } from 'src/models/recipe.ts';

const props = defineProps<{
  recipe: Recipe
}>();
const { recipe } = toRefs(props);

const customRecipe = computed(() => {
  const r = recipe.value;
  if (r) {
    r.ingredients = r.ingredients?.map((i) => ({ ...i, checked: false }));
  }
  return r;
});

function roundQuantity(value?: number): string {
  if (!value) {
    return '';
  }

  return Number(value.toFixed(2)).toString();
}

function isIngredientHighlighted(ingredient: RecipeIngredient): boolean {
  if (!recipe.value) {
    return false;
  }

  const name = getTranslation(ingredient.ingredient.name).toLowerCase();
  return recipe.value.steps.some((step) => getTranslation(step.description).toLowerCase().includes(name));
}
</script>
