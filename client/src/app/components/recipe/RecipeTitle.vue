<!--
  - Copyright (c) 2023-2024 Josef Müller.
  -->

<template>
    <div v-if="recipe" :class="{ 'recipe-title-wrapper': !noMargin }">
        <h3 v-if="title" class="subheader">
            {{ title }}
        </h3>
        <h2 class="recipe-title">
            <RouterLink :class="{ disabled: disableLink }" :to="recipeRoute"
            >{{ recipe?.getName() }}
            </RouterLink>
        </h2>
        <RecipeAuthor v-if="!noAuthor" :recipe="recipe"/>
    </div>
</template>

<script lang="ts" setup>
import { RouterLink } from 'vue-router';
import { computed, PropType, toRefs } from 'vue';
import { Recipe } from '@/shared';
import RecipeAuthor from '@/app/components/recipe/RecipeAuthor.vue';

const props = defineProps({
    recipe: {
        type: Object as PropType<Recipe>,
        required: true,
    },
    title: {
        type: String,
        required: false,
    },
    disableLink: {
        type: Boolean,
        required: false,
        default: false,
    },
    noAuthor: {
        type: Boolean,
        required: false,
        default: false,
    },
    noMargin: {
        type: Boolean,
        required: false,
        default: false,
    },
});

const { recipe } = toRefs(props);
const recipeRoute = computed<string>(() => recipe?.value?.getRoute() ?? '');
</script>

<style scoped>
/* Reset some default styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

a {
    color: var(--ion-text-color);
}

.recipe-title-wrapper {
    margin-bottom: 20px;
}

.recipe-title {
    font-size: var(--font-size-larger);
    word-break: break-word; /* Allows line breaks within words */
}

.recipe-title a {
    font-family: var(--font-special), serif;
    color: var(--ion-color-primary);
}

.recipe-title a:hover {
    color: var(--ion-color-primary-shade);
}
</style>
