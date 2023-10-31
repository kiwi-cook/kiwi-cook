<template>
    <div v-if="recipe">
        <h3 class="subheader">
            <RouterLink :class="{ disabled: disableLink }" :to="recipeRoute">{{ title }}</RouterLink>
        </h3>
        <h2 class="recipe-title">
            <RouterLink :class="{ disabled: disableLink }" :to="recipeRoute">{{ recipe?.getName() }}</RouterLink>
        </h2>
        <div v-if="recipe?.getAuthors() !== ''" class="recipe-author">
            <strong>By <a :href="recipe?.src?.url">{{ recipe?.getAuthors() }}</a></strong>
        </div>
    </div>
</template>
<script lang="ts" setup>
import {RouterLink} from "vue-router";
import {computed, PropType, toRefs} from "vue";
import {Recipe} from "@/shared/ts";

const props = defineProps({
    recipe: {
        type: Object as PropType<Recipe>,
        required: true
    },
    title: {
        type: String,
        required: false
    },
    disableLink: {
        type: Boolean,
        required: false,
        default: false
    }
})

const {recipe} = toRefs(props)
const recipeRoute = computed<string>(() => recipe?.value?.getRoute() ?? '')
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
</style>