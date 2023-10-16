<template>
    <section class="recipe-of-the-day">
        <TwoColumnLayout layout="rightBigger">
            <template #left>
                <div class="recipe-image">
                    <img :alt="recipe?.getName()"
                         :src="recipe?.props.imgUrl"
                         class="link" @click="routeToRecipe()"/>
                </div>
            </template>
            <template #right>
                <div class="recipe-details">
                    <RecipeTitle :recipe="recipe" :title="title"/>
                    <p class="recipe-description desc">{{ recipe?.getShortDescription() }}</p>
                </div>
            </template>
        </TwoColumnLayout>
    </section>
</template>

<script lang="ts" setup>
import {computed, PropType, toRefs} from "vue";
import {Recipe} from "@/shared";
import {useIonRouter} from "@ionic/vue";
import RecipeTitle from "@/shared/components/recipe/RecipeTitle.vue";
import TwoColumnLayout from "@/app/components/layout/TwoColumnLayout.vue";

const props = defineProps({
    recipe: {
        type: Object as PropType<Recipe>,
        required: true
    },
    title: {
        type: String,
        required: false
    }
})

const {recipe} = toRefs(props)
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
    margin-bottom: 20px;
}

/* Style for the recipe image */
.recipe-image img {
    width: 100%;
    height: auto;
    border-radius: 6px; /* Increased border radius */
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
        padding: 0;
    }
}
</style>