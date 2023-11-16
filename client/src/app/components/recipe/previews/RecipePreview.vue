<!--
  - Copyright (c) 2023 Josef Müller.
  -->

<template>
    <div class="recipe-preview">
        <div class="recipe-details">
            <RecipeTitle :recipe="uRecipe"/>
            <p class="recipe-description desc">{{ uRecipe.getShortDescription() }}</p>
            <div class="pill-container">

                <IonChip v-for="tag in tags" :key="tag">{{ tag }}</IonChip>
                <Duration :duration="duration"/>
                <IonChip>Servings: 1</IonChip>
            </div>
            <div class="recipe-ingredients">
                <h3>Ingredients</h3>
                <ul>
                    <li v-for="(item, index) in items" :key="index">{{ item.quantity }} {{ item.unit }}
                        {{ item.getName() }}
                    </li>
                </ul>
            </div>
        </div>
        <div class="recipe-image">
            <img :alt="uRecipe.getName()"
                 :src="uRecipe.props.imgUrl"
                 class="link" @click="toRecipe"/>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {computed, PropType, toRefs} from 'vue';
import {Item, Recipe, StepItem} from '@/shared';
import {IonChip, useIonRouter} from '@ionic/vue';
import RecipeTitle from '@/app/components/recipe/RecipeTitle.vue';
import {RecipeSuggestion} from '@/app/search';
import Duration from '@/shared/components/recipe/chip/Duration.vue';

const props = defineProps({
    recipe: {
        type: Object as PropType<RecipeSuggestion | Recipe>,
        required: true
    }
})
const {recipe} = toRefs(props)

// Unwrap recipe from suggestion if necessary
const uRecipe = computed<Recipe>(() => {
    if (recipe?.value instanceof RecipeSuggestion) {
        return recipe?.value?.recipe
    } else {
        return recipe?.value
    }
})

// Unwrap suggestion from recipe if necessary
const suggestion = computed(() => {
    if (recipe?.value instanceof RecipeSuggestion) {
        return recipe?.value
    } else {
        return undefined
    }
})

const missingItems = computed<StepItem[]>(() => suggestion?.value?.getMissingItems() ?? [])

const items = computed<StepItem[]>(() => {
    const stepItems = uRecipe?.value?.getStepItems()
    if (missingItems.value.length === 0) {
        return stepItems
    }

    const missingItemIds = missingItems?.value?.map((item: Item) => item.getId())
    return stepItems.filter((item: Item) => missingItemIds?.includes(item.getId())) ?? []
})

const router = useIonRouter();
const toRecipe = () => router.push(uRecipe?.value?.getRoute())

const duration = uRecipe?.value?.getDuration()
const tags = uRecipe?.value?.getTags()?.slice(0, 3)
</script>

<style scoped>
a {
    color: var(--ion-text-color);
}

.recipe-preview {
    display: flex;
    margin-bottom: 20px;
    border: 1px solid #ccc;
    border-radius: 6px;
}

.recipe-details {
    flex: 2;
    padding: 20px;
}

.recipe-title {
    font-size: var(--font-size-medium);
    font-family: var(--font-special);
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
    margin-top: 8px;
    font-size: var(--font-size-small);
}

.recipe-description {
    margin-top: 20px;
    max-height: 250px;
    overflow-y: auto;
}

.pill-container {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 10px;
}

.pill {
    background-color: #f0f0f0;
    color: #333;
    font-size: 14px;
    padding: 5px 10px;
    margin-right: 10px;
    margin-bottom: 10px;
    border-radius: 20px;
}

.pill.static {
    background-color: #e0e0e0;
}

.recipe-ingredients {
    margin-top: 20px;
}

.recipe-ingredients h3 {
    font-size: 20px;
    margin-bottom: 10px;
}

.recipe-ingredients ul {
    list-style-type: none;
    padding: 0;
}

.recipe-ingredients li {
    font-size: 16px;
    margin-bottom: 5px;
}

/* Style for the recipe image */
.recipe-image {
    flex: 1;
    margin: 20px;
}

.recipe-image img {
    width: 100%;
    height: auto;
    border-radius: 6px; /* Increased border radius */

    /* Shadow */
    box-shadow: var(--box-shadow-strong);
}

/* Mobile Screen Support */
@media screen and (max-width: 736px) {
    .recipe-preview {
        flex-direction: column-reverse; /* Stack items vertically */
    }

    .recipe-image,
    .recipe-details {
        flex: none; /* Reset flex properties for mobile layout */
    }

    .recipe-details {
        margin-top: 20px; /* Add margin between image and details */
    }
}
</style>