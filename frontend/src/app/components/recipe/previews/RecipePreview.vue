<template>
    <div class="recipe-preview">
        <div class="recipe-details">
            <RecipeTitle :recipe="recipe"/>
            <p class="recipe-description desc">{{ recipe.getShortDescription() }}</p>
            <div class="pill-container">
                <div v-for="tag in tags" :key="tag" class="pill">{{ tag }}</div>
                <div class="pill static">Prep: {{ duration }} mins</div>
                <div class="pill static">Servings: 1</div>
            </div>
            <div class="recipe-ingredients">
                <h3>Ingredients</h3>
                <ul>
                    <li v-for="(item, index) in recipe.getStepItems()" :key="index">{{ item.quantity }} {{ item.unit }}
                        {{ item.getName() }}
                    </li>
                </ul>
            </div>
        </div>
        <div class="recipe-image">
            <img :alt="recipe?.getName()"
                 :src="recipe?.props.imgUrl"
                 class="link" @click="toRecipe"/>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {computed, PropType, toRefs} from "vue";
import {Item, Recipe, RecipeSuggestion, StepItem} from "@/shared";
import {useIonRouter} from "@ionic/vue";
import RecipeTitle from "@/shared/components/recipe/RecipeTitle.vue";

const props = defineProps({
    recipe: {
        type: Object as PropType<RecipeSuggestion | Recipe>,
        required: true
    }
})

const recipe = computed<Recipe>(() => {
    const {recipe} = toRefs(props)

    if (recipe?.value instanceof Recipe) {
        return recipe?.value
    } else if (recipe?.value instanceof RecipeSuggestion) {
        return recipe?.value?.getRecipe()
    } else {
        return new Recipe()
    }
})

const missingItems = computed<StepItem[]>(() => {
    if (recipe?.value instanceof Recipe) {
        return recipe?.value?.getStepItems() ?? []
    } else if (recipe?.value instanceof RecipeSuggestion) {
        return recipe?.value?.getMissingItems() ?? []
    } else {
        return []
    }
})
const possessedItems = computed<Item[]>(() => {
    const missingItemIds = missingItems?.value?.map((item: Item) => item.getId())
    return recipe?.value?.getStepItems()?.filter((item: Item) => missingItemIds?.includes(item.getId())) ?? []
})

const router = useIonRouter();
const toRecipe = () => router.push({name: 'Recipe', params: {id: recipe.value?.getId()}})

const duration = recipe?.value?.getDuration()
const tags = recipe?.value?.getTags()?.slice(0, 3)
</script>

<style scoped>
a {
    text-decoration: none;
    transition: color 0.3s ease;
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
}

.recipe-image img {
    width: 100%;
    height: auto;
    border-radius: 6px; /* Increased border radius */
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
        width: 100%; /* Make both sections take full width */
    }

    .recipe-details {
        margin-top: 20px; /* Add margin between image and details */
    }
}
</style>