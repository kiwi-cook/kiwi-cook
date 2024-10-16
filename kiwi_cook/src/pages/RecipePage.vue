<template>
  <q-page class="recipe-experience" v-if="recipe">
    <div class="recipe-header" :style="{ backgroundImage: `url(${recipe.image_url})` }">
      <div class="header-content">
        <h1 class="text-h3">{{ getTranslation(recipe.name) }}</h1>
        <div class="recipe-meta">
          <q-icon name="access_time"/>
          {{ recipe.duration }} {{ $t('recipe.minutes') }}
          <q-icon name="restaurant"/>
          {{ recipe.servings }} {{ $t('recipe.servings') }}
          <q-icon name="whatshot"/>
          {{ recipe.difficulty }}
        </div>
      </div>
    </div>

    <div class="recipe-body">
      <div class="recipe-sidebar">
        <h2 class="text-h5 q-mb-md">{{recipe.ingredients?.length }} {{ $t('recipe.ingredients') }}</h2>
        <IngredientsList :recipe="recipe"/>

        <q-btn
          class="full-width q-mt-md"
          color="primary"
          icon="shopping_cart"
          :label="$t('shopping.addToList')"
          @click="addToShoppingList"
        />
      </div>

      <div class="recipe-main">
        <h2 class="text-h5 q-mb-md">{{ $t('recipe.steps') }}</h2>
        <StepsList :recipe="recipe"/>
      </div>
    </div>

    <q-dialog v-model="showNutrition">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ $t('recipe.nutrition_info') }}</div>
        </q-card-section>
        <q-card-section>
          <!-- Add nutrition information here -->
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-fab color="secondary" icon="more_vert" direction="up">
        <q-fab-action @click="shareRecipe" color="primary" icon="share"/>
        <q-fab-action @click="printRecipe" color="grey" icon="print"/>
        <q-fab-action @click="toggleFavorite" :color="isFavorite ? 'red' : 'grey-7'" icon="favorite"/>
        <q-fab-action @click="showNutrition = true" color="green" icon="nutrition"/>
      </q-fab>
    </q-page-sticky>
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

const showNutrition = ref(false);
const isFavorite = ref(false);

const shareRecipe = () => {
  // Implement share functionality
};

const printRecipe = () => {
  // Implement print functionality
};

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value;
  // Implement favorite toggling functionality
};

const addToShoppingList = () => {
  // Implement add to shopping list functionality
};
</script>

<style lang="scss">
.recipe-experience {
  .recipe-header {
    height: 300px;
    background-size: cover;
    background-position: center;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.7));
    }

    .header-content {
      position: absolute;
      bottom: 20px;
      left: 20px;
      color: white;
    }

    .recipe-meta {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 8px;

      .q-icon {
        font-size: 1.2em;
      }
    }
  }

  .recipe-body {
    display: flex;
    padding: 24px;
    gap: 24px;

    @media (max-width: 600px) {
      flex-direction: column;
    }
  }

  .recipe-sidebar {
    flex: 1;
    max-width: 300px;

    @media (max-width: 600px) {
      max-width: none;
    }
  }

  .recipe-main {
    flex: 2;
  }
}
</style>
