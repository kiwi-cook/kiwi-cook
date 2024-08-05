<!--
  - Copyright (c) 2023-2024 Josef Müller.
  -->

<template>
    <div v-if="decomposedRecipe" class="mini-recipe-preview-container" @click="routeToRecipe()">
        <img :alt="`Preview Image of ${decomposedRecipe?.getName()}`" :src="decomposedRecipe?.imageUrl"
             class="mini-recipe-preview-image"/>
        <div class="mini-recipe-tags">
            <Duration :duration="decomposedRecipe?.getDuration()" class="mini-recipe-tag"/>
        </div>
        <h3 class="mini-recipe-preview-title">{{ decomposedRecipe?.getName() }}</h3>
    </div>
</template>

<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { useIonRouter } from '@ionic/vue';
import { RecipeSuggestion } from '@/app/search';
import { Duration, Recipe } from '@/shared';

const props = defineProps({
    recipe: {
        type: Object as PropType<RecipeSuggestion | Recipe>,
        required: true
    }
})

const { recipe } = toRefs(props);
const decomposedRecipe = computed<Recipe | undefined>(() => {
    if (!recipe.value) {
        return undefined;
    }

    if (recipe.value instanceof RecipeSuggestion) {
        return recipe.value.recipe;
    } else {
        return recipe.value;
    }
});
const router = useIonRouter();
const recipeRoute = computed<string>(() => decomposedRecipe?.value?.getRoute() ?? '')
const routeToRecipe = () => router.push(recipeRoute?.value)
</script>

<style>
:root {
    --mini-recipe-width: 220px;
    --mini-recipe-height: 150px;
}

@media (width <= 1280px) {
    :root {
        --mini-recipe-width: 170px;
    }
}

@media (width <= 768px) {
    :root {
        --mini-recipe-width: 150px;
    }
}

.mini-recipe-preview-container {
    width: var(--mini-recipe-width); /* Set a maximum width for the preview */
    margin: var(--margin) auto;
    cursor: pointer;
}

.mini-recipe-preview-image {
    width: var(--mini-recipe-width); /* Set a fixed width */
    height: var(--mini-recipe-height); /* Set a fixed height */
    object-fit: cover; /* Crop the image if necessary */
    border-radius: 8px; /* Optional: Add rounded corners */
    transition: var(--transition);
    box-shadow: var(--box-shadow);
}

.mini-recipe-preview-image:hover {
    box-shadow: var(--box-shadow-hover) !important;
    transform: var(--scale)
}

.mini-recipe-preview-title {
    /* font */
    font-size: var(--font-size-smaller);
    font-weight: var(--font-weight-light);

    /* sizing */
    margin-top: var(--margin-small);
    width: 100%;
    box-sizing: border-box;
}

.mini-recipe-preview-tag {
    font-size: var(--font-size-small);
}
</style>
