<template>
    <div class="recipe-preview" @click="toRecipe">
        <div class="recipe-img-title-wrapper">
            <div class="recipe-img-wrapper">
                <IonImg :src="recipe.props.imgUrl" class="recipe-img"/>
            </div>
            <div class="recipe-title-author-mobile">
                <h2 class="recipe-title">
                    {{ recipe.getName() }}
                </h2>
                <h3 class="recipe-author subheader">
                    {{ recipe.getAuthors() }}
                </h3>
                <div>
                    <IonChip color="medium">
                        <IonLabel>{{ recipe.getDuration() }} min.</IonLabel>
                    </IonChip>
                    <IonChip color="medium">
                        <IonLabel>{{ recipe.getPrice() }} €</IonLabel>
                    </IonChip>
                    <template v-for="(tag, tagIndex) in recipe.getTags()" :key="tagIndex">
                        <IonChip color="light">
                            <IonLabel>{{ tag }}</IonLabel>
                        </IonChip>
                    </template>
                </div>
            </div>
        </div>
        <div class="recipe-details">
            <div class="recipe-title-author-large">
                <h2 class="recipe-title">
                    {{ recipe.getName() }}
                </h2>
                <h3 class="recipe-author subheader">
                    {{ recipe.getAuthors() }}
                </h3>
                <div>
                    <IonChip color="medium">
                        <IonLabel>{{ recipe.getDuration() }} min.</IonLabel>
                    </IonChip>
                    <template v-for="(tag, tagIndex) in recipe.getTags()" :key="tagIndex">
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

<script lang="ts">
import {computed, defineComponent, PropType, toRefs} from "vue";
import {Item, Recipe, RecipeSuggestion, StepItem} from "@/tastebuddy";
import {IonChip, IonImg, IonLabel, useIonRouter} from "@ionic/vue";
import ItemList from "@/components/recipe/ItemList.vue";

export default defineComponent({
    name: 'RecipeSuggestionPreview',
    components: {
        ItemList, IonImg, IonChip, IonLabel
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
    cursor: pointer;

    /* Layout */
    margin-bottom: var(--margin-medium);
    max-height: 450px;
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