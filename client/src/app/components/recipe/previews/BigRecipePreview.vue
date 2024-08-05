<!--
  - Copyright (c) 2023-2024 Josef Müller.
  -->

<template>
    <section>
        <div class="big-recipe-wrapper">
            <TwoColumnLayout layout="rightBigger">
                <template #left>
                    <div class="big-recipe-image">
                        <img v-if="recipe" :alt="recipe?.getName()"
                             :src="recipe?.imageUrl" class="link"
                             loading="lazy" @click="routeToRecipe()"/>
                    </div>
                </template>
                <template #right>
                    <div v-if="recipe" class="recipe-details">
                        <RecipeTitle :recipe="recipe" :title="title"/>
                        <p class="recipe-description desc">{{ recipe?.getShortDescription() }}</p>
                    </div>
                </template>
            </TwoColumnLayout>
        </div>
    </section>
</template>

<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { Recipe } from '@/shared';
import { useIonRouter } from '@ionic/vue';
import RecipeTitle from '@/app/components/recipe/RecipeTitle.vue';
import TwoColumnLayout from '@/app/components/layout/TwoColumnLayout.vue';

const props = defineProps({
    recipe: {
        type: Object as PropType<Recipe>, required: true
    }, title: {
        type: String, required: false
    }
})

const { recipe } = toRefs(props)
const router = useIonRouter();
const recipeRoute = computed<string>(() => recipe?.value?.getRoute() ?? '')
const routeToRecipe = () => router.push(recipeRoute?.value)
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

a:hover {
    color: var(--ion-color-primary);
}

/* Basic styles for the recipe section */
.big-recipe-wrapper {
    margin-bottom: 20px;
    border-radius: var(--border-radius);
    transition: var(--transition);
}

/* .big-recipe-wrapper:hover {
    box-shadow: var(--box-shadow-strong);
    transform: var(--scale);
} */

/* Style for the recipe image */
.big-recipe-image img {
    width: 100%;
    height: auto;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow-strong);
}

/* Style for the recipe details */
.recipe-details {
    display: flex;
    flex-direction: column;
    justify-content: center; /* Vertically center content */
}

.recipe-description {
    margin-top: 20px;
    max-height: 250px;
    overflow-y: auto;
}

/* Mobile Screen Support */
@media screen and (max-width: 736px) {
    .big-recipe-wrapper {
        flex-direction: column; /* Stack items vertically */
    }

    .big-recipe-image,
    .recipe-details {
        flex: none; /* Reset flex properties for mobile layout */
        width: 100%; /* Make both sections take full width */
    }

    .recipe-details {
        margin-top: 20px; /* Add margin between image and details */
        padding: 0;
    }
}
</style>
