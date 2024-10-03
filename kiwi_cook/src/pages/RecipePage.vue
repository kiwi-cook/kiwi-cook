<template>
  <q-page class="recipe-experience" v-if="recipe">
    <div class="fullscreen bg-dark text-white">
      <div class="recipe-header" :style="{ backgroundImage: `url(${recipe.image_url})` }">
        <div class="header-content">
          <h1 class="text-h2 text-weight-bold text-white">{{ getTranslation(recipe.name) }}</h1>
          <q-btn
            color="green-5"
            text-color="black"
            :icon="expanded ? 'expand_more' : 'expand_less'"
            :label="expanded ? 'Hide Details' : 'Show Details'"
            @click="expanded = !expanded"
            class="q-mt-md"
          />
        </div>
      </div>

      <q-slide-transition>
        <div v-show="expanded" class="recipe-quick-info q-pa-md">
          <div class="row q-col-gutter-md justify-center">
            <div v-for="(info, index) in recipeInfo" :key="index" class="col-auto">
              <q-chip
                color="green-5"
                text-color="black"
                size="lg"
                :icon="info.icon"
              >
                {{ info.value }}
              </q-chip>
            </div>
          </div>
          <p class="text-body1 text-center q-mt-md">{{ getTranslation(recipe.description) }}</p>
        </div>
      </q-slide-transition>

      <div class="recipe-content q-pa-md">
        <q-splitter
          v-model="splitterModel"
          style="height: 400px"
        >
          <template v-slot:before>
            <div class="q-pa-md">
              <h2 class="text-h4 text-green-5">Ingredients</h2>
              <q-list dark bordered separator>
                <q-item v-for="(ingredient, index) in recipe.ingredients" :key="index" clickable v-ripple>
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
            </div>
          </template>

          <template v-slot:after>
            <div class="q-pa-md">
              <h2 class="text-h4 text-green-5">Steps</h2>
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
                      <div class="step-description"
                           v-html="highlightIngredients(getTranslation(step.description))"></div>
                    </q-item-section>
                  </q-item>
                </q-intersection>
              </q-list>
            </div>
          </template>
        </q-splitter>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useRecipeStore } from 'stores/recipe-store';
import { storeToRefs } from 'pinia';
import { getTranslation, RecipeIngredient } from 'src/models/recipe';

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

const expanded = ref(false);
const splitterModel = ref(50);

const recipeInfo = computed(() => {
  if (!recipe.value) {
    return [];
  }

  return [
    { icon: 'access_time', value: `${recipe.value.duration} min` },
    { icon: 'people', value: `${recipe.value.servings} servings` },
    { icon: 'list', value: `${recipe.value.ingredients?.length} ingredients` },
    { icon: 'restaurant_menu', value: `${recipe.value.steps.length} steps` },
  ];
});

function roundQuantity(value?: number): string {
  if (!value) {
    return '';
  }

  return Number(value.toFixed(2)).toString();
}

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

function isIngredientHighlighted(ingredient: RecipeIngredient): boolean {
  if (!recipe.value || !recipe.value.steps) {
    return false;
  }

  const name = getTranslation(ingredient.ingredient.name).toLowerCase();
  return recipe.value.steps.some((step) => getTranslation(step.description).toLowerCase().includes(name));
}
</script>

<style lang="scss">
.recipe-experience {
  .recipe-header {
    height: 50vh;
    background-size: cover;
    background-position: center;
    position: relative;

    &:before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background: rgba(0, 0, 0, 0.5);
    }

    .header-content {
      position: relative;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
      padding: 2rem;
    }
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
    max-width: 500px;
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
