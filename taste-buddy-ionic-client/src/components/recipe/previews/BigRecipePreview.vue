<!--
  - Copyright (c) 2023-2024 Josef Müller.
  -->

<template>
    <section>
        <div class="big-recipe-wrapper">
            <TwoColumnLayout layout="rightBigger">
                <template #left>
                    <div class="big-recipe-image-wrapper">
                        <img
                            v-if="recipe"
                            :alt="recipe?.getName()"
                            :src="recipe?.imageUrl"
                            class="link big-recipe-image"
                            loading="lazy"
                            @click="routeToRecipe"
                        />
                        <div class="button-container">
                            <button class="action-button play-button" @click.stop="routeToRecipe">
                                <span class="button-icon">▶</span>
                            </button>
                            <Duration :duration="recipe?.getDuration()" :timer-key="recipe?.getId()"/>
                            <!-- Add more buttons as needed -->
                        </div>
                    </div>
                </template>
                <template #right>
                    <div v-if="recipe" class="recipe-details">
                        <RecipeTitle :recipe="recipe" :title="title"/>
                        <p class="recipe-description desc">
                            {{ recipe?.getShortDescription() }}
                        </p>
                        <div class="recipe-tags ion-margin-bottom">
                            <IonChip v-for="tag in recipe?.getTags()" :key="tag" outline>
                                {{ tag }}
                            </IonChip>
                        </div>
                    </div>
                </template>
            </TwoColumnLayout>
        </div>
    </section>
</template>

<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { Recipe } from '@/shared';
import { IonChip, useIonRouter } from '@ionic/vue';
import RecipeTitle from '@/app/components/recipe/RecipeTitle.vue';
import TwoColumnLayout from '@/app/components/layout/TwoColumnLayout.vue';
import Duration from '@/shared/components/time/Duration.vue';

import '../recipe.css'

const props = defineProps({
    recipe: {
        type: Object as PropType<Recipe>,
        required: true,
    },
    title: {
        type: String,
        required: false,
    },
});

const { recipe } = toRefs(props);
const router = useIonRouter();
const recipeRoute = computed<string>(() => recipe?.value?.getRoute() ?? '');
const routeToRecipe = () => router.push(recipeRoute?.value);
</script>

<style scoped>
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

/* Style for the recipe image */
.big-recipe-image-wrapper {
    position: relative;
    overflow: hidden;
    border-radius: var(--border-radius);
}

.button-container {
    position: absolute;
    bottom: 20px;
    left: 20px;
    display: flex;
    gap: 10px;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 2; /* Ensure buttons are above the image */
}

.action-button {
    width: 40px;
    height: 40px;
    background-color: rgba(0, 0, 0, 0.7);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border: none;
    transition: background-color 0.3s ease;
}

.action-button:hover {
    background-color: rgba(0, 0, 0, 0.9);
}

.button-icon {
    color: white;
    font-size: 18px;
}

.big-recipe-image-wrapper:hover .button-container {
    opacity: 1;
}

.big-recipe-image-wrapper::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
    border-bottom-left-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
    z-index: 1; /* Ensure gradient is above the image but below buttons */
}

.big-recipe-image-wrapper:hover::after {
    opacity: 1;
}

.big-recipe-image-wrapper img {
    width: 100%;
    height: auto;
    border-radius: var(--border-radius);
    transition: transform 0.3s ease;
}

.big-recipe-image-wrapper:hover img {
    transform: scale(1.05);
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

    .big-recipe-image-wrapper,
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
