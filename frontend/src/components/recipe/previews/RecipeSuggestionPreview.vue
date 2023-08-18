<template>
    <div class="recipe-preview">
        <div class="recipe-img-wrapper">
            <IonImg :src="recipe.props.imgUrl" class="recipe-img"/>
        </div>
        <div class="recipe-details">
            <div>
                <h1 class="recipe-title">
                    {{ recipe.name }}
                </h1>
                <h2 class="recipe-author">
                    {{ recipe.getAuthors() }}
                </h2>
            </div>
            <div class="recipe-item-list">
                <ItemList v-if="possessedItems.length > 0" :items="possessedItems" :disable-click="true" :no-lines="true"/>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {computed, defineComponent, PropType, toRefs} from "vue";
import {Item, Recipe, RecipeSuggestion, StepItem} from "@/tastebuddy";
import {IonImg, useIonRouter} from "@ionic/vue";
import ItemList from "@/components/recipe/ItemList.vue";

export default defineComponent({
    name: 'RecipeSuggestionPreview',
    components: {
        ItemList, IonImg
    },
    props: {
        recipeSuggestion: {
            type: Object as PropType<RecipeSuggestion>,
            required: true
        }
    },
    setup(props: { recipeSuggestion: RecipeSuggestion }) {
        const {recipeSuggestion} = toRefs(props)
        const recipe = computed<Recipe>(() => recipeSuggestion.value?.recipe ?? new Recipe())
        const missingItems = computed<StepItem[]>(() => recipeSuggestion.value?.getMissingItems() ?? [])
        const possessedItems = computed<Item[]>(() => {
            const missingItemIds = missingItems.value.map(item => item.getId())
            return recipe.value.getStepItems().filter(item => !missingItemIds.includes(item.getId()))
        })
        const additionalTags = computed<string[]>(() => [
            (recipeSuggestion.value.recipe_price ?? 0) + ' €'
        ])

        const router = useIonRouter();
        const toRecipe = () => {
            router.push({name: 'Recipe', params: {id: recipe.value?.getId()}})
        }

        return {
            recipe, missingItems, possessedItems, additionalTags,
            toRecipe
        }
    }
});
</script>

<style scoped>
.recipe-preview {
    border: var(--border);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);

    margin-bottom: var(--margin-medium);

    /* Layout */
    height: 400px;
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center; /* Center items vertically */
    justify-content: center; /* Center items horizontally */
}

.recipe-title {
    font-weight: var(--font-weight-bold);
    margin: 0;
}

.recipe-author {
    margin-top: 0;
    font-weight: var(--font-weight-normal);
    color: var(--ion-color-medium);
}

.recipe-img-wrapper {
    position: relative;
    margin: 25px;
    width: 250px; /* Adjust this value to your desired size */
    height: 250px; /* Same value as width */
    overflow: hidden;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
}

@media (width < 768px) {
    .recipe-img-wrapper {
        width: 150px;
        height: 150px;
    }
}

@media (width < 576px) {
    .recipe-img-wrapper {
        width: 100px;
        height: 100px;
    }
}

.recipe-img::part(image) {
    position: absolute;
    width: auto;
    height: 100%;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}

.recipe-details {
    padding: 16px;
}

.recipe-item-list {
    overflow-y: auto;
    max-height: 250px;
}
</style>