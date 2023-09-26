<template>
    <div class="recipe-preview" @click="toRecipe">
        <div class="recipe-img-title-wrapper">
            <img class="recipe-preview-image" :src="_recipe?.props?.imgUrl"
                 :alt="`Preview Image of ${name}`">
            <div class="recipe-title-author-mobile">
                <h2 class="recipe-title">
                    {{ name }}
                </h2>
                <h3 class="recipe-author subheader">
                    {{ authors }}
                </h3>
                <div>
                    <IonChip color="medium">
                        <IonLabel>{{ duration }} min.</IonLabel>
                    </IonChip>
                    <IonChip color="medium">
                        <IonLabel>{{ price }} €</IonLabel>
                    </IonChip>
                    <template v-for="(tag, tagIndex) in tags" :key="tagIndex">
                        <IonChip color="medium">
                            <IonLabel>{{ tag }}</IonLabel>
                        </IonChip>
                    </template>
                </div>
            </div>
        </div>
        <div class="recipe-details">
            <div class="recipe-title-author-large">
                <h2 class="recipe-title">
                    {{ name }}
                </h2>
                <h3 class="recipe-author subheader">
                    {{ authors }}
                </h3>
                <div>
                    <IonChip color="medium">
                        <IonLabel>{{ duration }} min.</IonLabel>
                    </IonChip>
                    <template v-for="(tag, tagIndex) in tags" :key="tagIndex">
                        <IonChip color="light">
                            <IonLabel>{{ tag }}</IonLabel>
                        </IonChip>
                    </template>
                </div>
            </div>
            <div class="recipe-item-list">
                <ItemList v-if="possessedItems.length > 0" :items="possessedItems" :disable-click="true"
                          :no-lines="true"/>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {computed, PropType, toRefs} from "vue";
import {Item, Recipe, RecipeSuggestion, StepItem} from "@/tastebuddy";
import {IonChip, IonLabel, useIonRouter} from "@ionic/vue";
import ItemList from "@/components/recipe/ItemList.vue";

const props = defineProps({
    recipe: {
        type: Object as PropType<RecipeSuggestion|Recipe>,
        required: true
    }
})
const {recipe} = toRefs(props)
const _recipe = computed<Recipe>(() => {
    if (recipe?.value instanceof Recipe) {
        return recipe?.value
    } else if (recipe?.value instanceof RecipeSuggestion) {
        return recipe?.value?.getRecipe()
    } else {
        return new Recipe()
    }
})

const missingItems = computed<StepItem[]>(() => {
    if (_recipe?.value instanceof Recipe) {
        return _recipe?.value?.getStepItems() ?? []
    } else if (recipe?.value instanceof RecipeSuggestion) {
        return recipe?.value?.getMissingItems() ?? []
    } else {
        return []
    }
})
const possessedItems = computed<Item[]>(() => {
    const missingItemIds = missingItems?.value?.map((item: Item) => item.getId())
    return _recipe?.value?.getStepItems()?.filter((item: Item) => missingItemIds?.includes(item.getId())) ?? []
})

const router = useIonRouter();
const toRecipe = () => {
    router.push({name: 'Recipe', params: {id: _recipe.value?.getId()}})
}

const name = computed(() => _recipe?.value?.getName())
const authors = computed(() => _recipe?.value?.getAuthors())
const duration = computed(() => _recipe?.value?.getDuration())
const price = computed(() => _recipe?.value?.getPrice())
const tags = computed(() => _recipe?.value?.getTags()?.slice(0, 3))
</script>

<style>

:root {
    --recipe-preview-image-size: 200px;
}

@media (width <= 1280px) {
    :root {
        --recipe-preview-image-size: 170px;
    }
}

@media (width <= 768px) {
    :root {
        --recipe-preview-image-size: 150px;
    }
}

.recipe-preview-image {
    /* Layout */
    width: var(--recipe-preview-image-size); /* Set a fixed width */
    height: var(--recipe-preview-image-size); /* Set a fixed height */
    object-fit: cover; /* Crop the image if necessary */
    border-radius: 8px; /* Optional: Add rounded corners */
    border: var(--border);

    /* Animation */
    transition: var(--transition);

    /* Positioning */
    margin: var(--margin);
}
</style>

<style scoped>
.recipe-preview {
    border: var(--border);
    border-radius: var(--border-radius);
    cursor: pointer;

    /* Layout */
    margin-bottom: var(--margin-medium);
    display: flex;
    flex-direction: row;
}

@media (width <= 500px) {
    .recipe-preview {
        flex-direction: column;
        height: auto;
    }
}

.recipe-img-title-wrapper {
    display: flex;
}

.recipe-title-author-mobile {
    margin-top: var(--margin-large);
    display: none;
}

.recipe-title-author-large {
    margin-bottom: var(--margin-large);
}

.recipe-title {
    font-weight: var(--font-weight-bold);
    margin: 0;
}

.recipe-author {
    margin-top: 0;
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-normal);
    color: var(--ion-color-medium);
}

@media (width <= 500px) {
    .recipe-title {
        max-width: 200px;
    }

    .recipe-title-author-mobile {
        display: initial;
    }

    .recipe-title-author-large {
        display: none;
    }
}


.recipe-preview-image:hover {
    box-shadow: var(--box-shadow-hover) !important;
    transform: scale(1.02, 1.02);
}

.recipe-details {
    padding: 16px;
}

.recipe-item-list-and-description {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

.recipe-description {
    font-size: var(--font-size-small);
    color: var(--ion-color-medium);
    width: 40%;
    overflow-y: auto;
    max-height: 250px;
}

.recipe-item-list {
    overflow-y: auto;
    max-height: 250px;
}
</style>