<!--
  - Copyright (c) 2024 Josef Müller.
  -->

<template>
    <div v-if="recipe && recipe?.getAuthors() !== ''" class="recipe-author">
        <strong
        >{{ $t("Recipe.Src.By") }}
            <a
                :href="recipe?.src?.url"
                class="recipe-author-link"
                rel="nofollow"
                target="_blank"
            >{{ recipe?.getAuthors() }}</a
            ></strong
        >
    </div>
</template>

<script lang="ts" setup>
import { PropType, toRefs } from 'vue';
import { Recipe } from '@/shared';

const props = defineProps({
    recipe: {
        type: Object as PropType<Recipe>,
        required: true,
    }
});

const { recipe } = toRefs(props);
</script>

<style scoped>
.recipe-title a:hover {
    color: var(--ion-color-primary-shade);
}

.recipe-author {
    margin-top: 5px;
    font-size: 20px; /* Increased font size */
}

.recipe-author-link {
    cursor: pointer;
}
</style>
