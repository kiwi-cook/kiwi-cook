<template>
    <section class="recipe-of-the-day">
        <div class="recipe-image">
            <img :src="recipe?.props.imgUrl"
                 :alt="recipe?.getName()"
                 class="link" @click="routeToRecipe()">
        </div>
        <div class="recipe-details">
            <h3 class="subheader">
                <RouterLink :to="{name: 'RecipeOfTheDay'}">Recipe of the day</RouterLink>
            </h3>
            <h2 class="recipe-title">
                <RouterLink :to="{name: 'RecipeOfTheDay'}">{{ recipe?.getName() }}</RouterLink>
            </h2>
            <div v-if="recipe?.getAuthors() !== ''" class="recipe-author">
                <strong>By <a :href="recipe?.src?.url">{{ recipe?.getAuthors() }}</a></strong>
            </div>
            <p class="recipe-description desc">{{ recipe?.getShortDescription() }}</p>
        </div>
    </section>
</template>

<script setup lang="ts">
import {PropType, toRefs} from "vue";
import {Recipe} from "@/shared";
import {useIonRouter} from "@ionic/vue";
import {RouterLink} from "vue-router";

const props = defineProps({
    recipe: {
        type: Object as PropType<Recipe>,
        required: true
    }
})

const {recipe} = toRefs(props)
const router = useIonRouter();
const routeToRecipe = () => router.push({ name: 'RecipeOfTheDay' })
</script>

<style scoped>
/* Reset some default styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

a {
    text-decoration: none;
    transition: color 0.3s ease;
    color: var(--ion-text-color);
}

a:hover {
    color: var(--ion-color-primary);
}

/* Reset some default styles */
/* (Your existing reset styles) */

/* Basic styles for the recipe section */
.recipe-of-the-day {
    display: flex;
    margin-bottom: 20px;
}

/* Style for the recipe image */
.recipe-image {
    flex: 1;
}

.recipe-image img {
    width: 100%;
    height: auto;
    border-radius: 6px; /* Increased border radius */
    box-shadow: var(--box-shadow-strong);
}

/* Style for the recipe details */
.recipe-details {
    flex: 2;
    display: flex;
    flex-direction: column;
    justify-content: center; /* Vertically center content */
    padding: 0 20px;
}

.recipe-title {
    font-size: var(--font-size-larger);
    margin-bottom: 10px;
}

.recipe-title a {
    font-family: var(--font-special);
    color: var(--ion-color-primary);
    transition: color 0.3s ease;
}

.recipe-title a:hover {
    color: var(--ion-color-primary-shade);
}

.recipe-author {
    font-size: 20px; /* Increased font size */
}

.recipe-description {
    margin-top: 20px;
    max-height: 250px;
    overflow-y: auto;
}

/* Mobile Screen Support */
@media screen and (max-width: 736px) {
    .recipe-of-the-day {
        flex-direction: column; /* Stack items vertically */
    }

    .recipe-image,
    .recipe-details {
        flex: none; /* Reset flex properties for mobile layout */
        width: 100%; /* Make both sections take full width */
    }

    .recipe-details {
        margin-top: 20px; /* Add margin between image and details */
    }
}
</style>