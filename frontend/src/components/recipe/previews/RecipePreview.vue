<template>
    <div class="recipe-preview" @click="toRecipe">
        <div class="recipe-img-title-wrapper">
            <img class="recipe-preview-image" :src="recipe?.props?.imgUrl"
                 :alt="`Preview Image of ${recipe?.getName()}`">
            <div class="recipe-title-author-mobile">
                <h2 class="recipe-title">
                    {{ name }}
                </h2>
                <h3 class="recipe-author subheader">
                    {{ recipe.getAuthors() }}
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
                    {{ recipe?.getAuthors() }}
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
    recipeSuggestion: {
        type: Object as PropType<RecipeSuggestion>,
        required: true
    }
})
const {recipeSuggestion} = toRefs(props)
const recipe = computed<Recipe>(() => recipeSuggestion?.value?.recipe ?? new Recipe())

const missingItems = computed<StepItem[]>(() => recipeSuggestion.value?.getMissingItems() ?? [])
const possessedItems = computed<Item[]>(() => {
    const missingItemIds = missingItems.value.map(item => item.getId())
    return recipe.value.getStepItems().filter(item => !missingItemIds.includes(item.getId()))
})

const router = useIonRouter();
const toRecipe = () => {
    router.push({name: 'Recipe', params: {id: recipe.value?.getId()}})
}

const name = computed(() => recipe.value?.getName())
const duration = computed(() => recipe.value?.getDuration())
const price = computed(() => recipe.value?.getPrice())
const tags = computed(() => recipe.value?.getTags().slice(0, 3))
</script>

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

.recipe-preview-image {
    /* Layout */
    width: 150px; /* Set a fixed width */
    height: 150px; /* Set a fixed height */
    object-fit: cover; /* Crop the image if necessary */
    border-radius: 8px; /* Optional: Add rounded corners */
    border: var(--border);

    /* Animation */
    transition: var(--transition);

    /* Positioning */
    margin: var(--margin);
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