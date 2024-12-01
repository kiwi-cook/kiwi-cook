<!-- StepsList.vue -->
<template>
  <q-list>
    <q-item
v-for="(step, index) in recipe.steps"
            :key="index"
            class="step-item q-mb-md">
      <q-item-section avatar>
        <q-avatar color="green-5">
          {{ index + 1 }}
        </q-avatar>
      </q-item-section>
      <q-item-section>
        <div class="step-description" v-html="highlightIngredients(getTranslation(step.description))"></div>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { defineProps, toRefs } from 'vue';
import type { Recipe } from 'src/models/recipe';
import { getTranslation } from 'src/models/recipe';

const props = defineProps<{
  recipe: Recipe
}>();
const { recipe } = toRefs(props);

function highlightIngredients(text: string): string {
  if (!recipe.value || !recipe.value.ingredients) {
    return text;
  }

  recipe.value.ingredients.forEach((ingredient) => {
    const name = getTranslation(ingredient.ingredient.name).toLowerCase();
    const regex = new RegExp(`\\b${name}\\b`, 'gi');
    text = text.replace(regex, '<span class="text-accent text-bold">$&</span>');
  });

  return text;
}

</script>

<style lang="scss">
.step-item {
  padding: 14px 18px;
  border: 2px solid $q-color-primary;
  border-radius: 16px 16px 16px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.step-description {
  font-size: 1.1em;
  line-height: 1.5;

}
</style>
