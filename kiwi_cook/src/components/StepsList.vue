<!-- StepsList.vue -->
<template>
  <q-list dark bordered separator>
    <q-intersection
      v-for="(step, index) in recipe.steps"
      :key="index"
      transition="scale"
      class="step-item"
    >
      <q-item>
        <q-item-section avatar>
          <q-avatar color="green-5" text-color="black">
            {{ index + 1 }}
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <div class="step-description" v-html="highlightIngredients(getTranslation(step.description))"></div>
        </q-item-section>
      </q-item>
    </q-intersection>
  </q-list>
</template>

<script setup lang="ts">
import { defineProps, toRefs } from 'vue';
import { getTranslation, Recipe } from 'src/models/recipe.ts';

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
    text = text.replace(regex, '<span class="text-green-5">$&</span>');
  });

  return text;
}

</script>
