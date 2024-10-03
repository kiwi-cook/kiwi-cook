<template>
  <q-page class="recipe-experience" v-if="recipe">
    <div class="bg-dark text-white">
      <q-parallax
        :height="300"
        :src="recipe.image_url"
      >
        <h2 class="custom-caption">
          {{ getTranslation(recipe.name) }}
        </h2>
      </q-parallax>

      <div class="recipe-content">
        <q-splitter
          v-model="splitterModel"
          v-if="!$q.screen.lt.sm && !$q.screen.lt.md"
          class="full-height"
        >
          <template v-slot:before>
            <h2 class="text-h4 text-green-5">
              {{ $t('recipe.ingredients') }}
            </h2>
            <IngredientsList :recipe="recipe"/>
          </template>

          <template v-slot:after>
            <h2 class="text-h4 text-green-5">
              {{ $t('recipe.steps') }}
            </h2>
            <StepsList :recipe="recipe"/>
          </template>
        </q-splitter>

        <div v-else>
          <h2 class="text-h4 text-green-5">
            {{ $t('recipe.ingredients') }}
          </h2>
          <IngredientsList :recipe="recipe"/>

          <h2 class="text-h4 text-green-5">
            {{ $t('recipe.steps') }}
          </h2>
          <StepsList :recipe="recipe"/>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useRecipeStore } from 'stores/recipe-store';
import { storeToRefs } from 'pinia';
import { getTranslation } from 'src/models/recipe';
import StepsList from 'components/StepsList.vue';
import IngredientsList from 'components/IngredientsList.vue';

const route = useRoute();
const recipes = useRecipeStore();
const { recipeMap } = storeToRefs(recipes);
const recipe = computed(() => {
  const r = recipeMap.value.get(route.params.id as string);
  if (r) {
    r.ingredients = r.ingredients?.map((i) => ({ ...i, checked: false }));
  }
  return r;
});

const splitterModel = ref(20);
</script>

<style lang="scss">
.recipe-experience {
  .custom-caption {
    text-align: center;
    padding: 12px;
    color: white;
    background-color: rgba(0, 0, 0, .2);
  }

  .recipe-quick-info {
    background: rgba(0, 0, 0, 0.8);
  }

  .recipe-content {
    .q-splitter {
      background: rgba(0, 0, 0, 0.8) !important;
    }
  }

  .q-list {
    width: 100%;
  }

  .step-item {
    transition: all 0.3s ease;

    &.q-intersection--entered {
      transform: scale(1);
      opacity: 1;
    }

    &:not(.q-intersection--entered) {
      transform: scale(0.95);
      opacity: 0.7;
    }
  }

  .step-description {
    font-size: 1.1em;
    line-height: 1.5;
  }
}
</style>
