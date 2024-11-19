<template>
  <q-page class="mobile-recipe-container" v-if="recipe">
    <div class="recipe-header">
      <div class="header-content">
        <div class="image-wrapper" v-if="recipe.image_url">
          <img
            :src="recipe.image_url"
            :alt="getTranslation(recipe.name)"
            class="recipe-image"
          />
        </div>
        <div class="recipe-details">
          <h1 class="recipe-title">{{ getTranslation(recipe.name) }}</h1>
          <span class="recipe-description">{{ getTranslation(recipe.description) }}</span>
          <div class="recipe-meta">
            <div class="meta-item" v-for="(item, index) in metaItems" :key="index">
              <span class="meta-icon">{{ item.icon }}</span>
              <span class="meta-value">{{ item.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <q-tabs v-model="activeTab" dense class="recipe-tabs" active-color="primary">
      <q-tab name="ingredients" icon="local_dining" label="Ingredients" />
      <q-tab name="steps" icon="list" label="Steps" />
    </q-tabs>

    <div v-if="activeTab === 'ingredients'" class="ingredients-section">
      <div class="servings-control">
        <label class="servings-label">Adjust Servings</label>
        <q-slider
          v-model="servings"
          :min="1"
          :max="recipe.servings * 2"
          color="primary"
          track-color="grey-3"
          class="servings-slider"
        />
      </div>

      <q-list class="ingredients-list">
        <RecipeIngredient
          v-for="(ingredient, index) in recipe.ingredients"
          :key="index"
          v-model="checkedIngredients[index]"
          :ingredient="ingredient"
          :servings="servings"
        />
      </q-list>
    </div>

    <div v-if="activeTab === 'steps'" class="steps-container">
      <q-card
        v-for="(step, index) in recipe.steps"
        :key="index"
        class="step-card"
        :class="{ 'step-completed': checkedIngredients.every((checked) => checked) }"
      >
        <q-card-section>
          <div class="step-header">
            <div class="step-number">{{ $t("recipe.direction") }} {{ index + 1 }}</div>
          </div>
          <div class="step-description">
            {{ getTranslation(step.description) }}
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { getTranslation } from 'src/models/recipe';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useRecipeStore } from 'src/stores/recipe-store';
import { useRoute } from 'vue-router';
import RecipeIngredient from 'src/components/recipe/RecipeIngredient.vue';

const { t } = useI18n();

const activeTab = ref('ingredients');
const route = useRoute();
const recipeStore = useRecipeStore();
const { recipeMap } = storeToRefs(recipeStore);

const recipe = computed(() => {
  let recipeId = route.params.id;
  if (Array.isArray(recipeId)) {
    [recipeId] = recipeId;
  }
  return recipeMap.value.get(recipeId);
});

const servings = ref(recipe.value?.servings ?? 1);
const checkedIngredients = ref(
  recipe?.value?.ingredients?.map(() => false) ?? [],
);

const metaItems = computed(() => {
  if (!recipe.value) return [];
  return [
    {
      icon: '⏱️',
      value: `${recipe.value.duration} ${t('recipe.minutes', { count: recipe.value.duration })}`,
    },
    {
      icon: '👥',
      value: `${servings.value} servings`,
    },
    ...recipe?.value?.props.tags?.map((tag: string) => ({
      icon: '🏷️',
      value: tag,
    })) ?? [],
  ];
});
</script>

<style lang="scss" scoped>
.mobile-recipe-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 20px;
}

.recipe-header {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
  }
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
}

.image-wrapper {
  flex: 0 0 150px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.recipe-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.recipe-details {
  flex-grow: 1;
  flex-basis: 0;
}

.recipe-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 1.6em;
  font-weight: 600;
  color: $grey-9;
  line-height: 1.3;
  margin-bottom: 8px;
  word-wrap: break-word;
  hyphens: auto;
  overflow-wrap: break-word;
}

.recipe-description {
  color: $grey-7;
  font-size: 1.1em;
  margin-bottom: 12px;
}

.recipe-meta {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: $grey-7;
  font-size: 0.95em;

  @media (prefers-color-scheme: dark) {
    color: $grey-3;
  }
}

.servings-control {
  margin-bottom: 20px;
  padding: 0 16px;
}

.servings-label {
  display: block;
  margin-bottom: 10px;
  color: $grey-7;
  font-weight: 600;

  @media (prefers-color-scheme: dark) {
    color: $grey-3;
  }
}

.steps-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  padding: 0 16px;
}

.step-card {
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &.step-completed {
    opacity: 0.7;
  }
}

.step-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.step-number {
  font-weight: bold;
  color: $grey-7;
  opacity: 0.7;
}

.step-description {
  line-height: 1.6;
  color: $grey-7;
}

.body--dark {
  .recipe-header {
    background-color: $dark;
  }

  .recipe-title {
    color: $grey-1;
  }

  .recipe-description {
    color: $grey-3;
  }

  .meta-item {
    color: $grey-3;
  }

  .step-card {
    background-color: $dark;
    color: $grey-3;
  }

  .step-number {
    color: white;
  }

  .step-description {
    color: $grey-5;
  }
}
</style>
