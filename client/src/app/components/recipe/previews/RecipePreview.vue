<!--
  - Copyright (c) 2023-2024 Josef Müller.
  -->

<template>
    <IonCard v-if="decomposedRecipe" class="recipe-preview">
        <div class="recipe-content">
            <div class="image-container">
                <img :alt="decomposedRecipe.getName()" :src="decomposedRecipe.imageUrl" @click="toRecipe"/>
            </div>
            <div class="text-content">
                <IonCardTitle>{{ decomposedRecipe.getName() }}</IonCardTitle>
                <IonCardSubtitle>{{ decomposedRecipe.getShortDescription() }}</IonCardSubtitle>
                <div class="recipe-meta">
                    <IonChip>
                        <IonIcon :icon="timeOutline"/>
                        <IonLabel>{{ duration }}</IonLabel>
                    </IonChip>
                    <IonChip>
                        <IonIcon :icon="peopleOutline"/>
                        <IonLabel>{{ decomposedRecipe.servings }} {{
                            $t('Recipe.Serving', decomposedRecipe.servings)
                        }}
                        </IonLabel>
                    </IonChip>
                </div>
            </div>
        </div>
        <IonCardContent>
            <IonButton expand="block" fill="clear" @click="toggleIngredients">
                {{ showIngredients ? 'Hide' : 'Show' }} {{ decomposedRecipe.getRecipeIngredients().length }} Ingredients
                <IonIcon slot="end" :icon="showIngredients ? chevronUpOutline : chevronDownOutline"/>
            </IonButton>
            <IonList v-if="showIngredients">
                <IonItem v-for="(item, index) in items" :key="index">
                    <IonLabel>{{ item.quantity }} {{ item.unit }} {{ item.ingredient.getName() }}</IonLabel>
                </IonItem>
            </IonList>
        </IonCardContent>
    </IonCard>
</template>

<script lang="ts" setup>
import { computed, PropType, ref, toRefs } from 'vue';
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardSubtitle,
    IonCardTitle,
    IonChip,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    useIonRouter
} from '@ionic/vue';
import { chevronDownOutline, chevronUpOutline, peopleOutline, timeOutline } from 'ionicons/icons';
import { Recipe, RecipeIngredient } from '@/shared';
import { RecipeSuggestion } from '@/app/search';

const props = defineProps({
    recipe: {
        type: Object as PropType<RecipeSuggestion | Recipe>,
        required: true
    }
});

const { recipe } = toRefs(props);

const decomposedRecipe = computed<Recipe | null>(() => {
    if (!recipe.value) {
        return null;
    }
    return recipe.value instanceof RecipeSuggestion ? recipe.value.recipe : recipe.value;
});

const items = computed<RecipeIngredient[]>(() => decomposedRecipe.value?.ingredients ?? []);

const router = useIonRouter();
const toRecipe = () => router.push(decomposedRecipe.value?.getRoute());

const duration = computed(() => decomposedRecipe.value?.getDuration());

const showIngredients = ref(false);
const toggleIngredients = () => {
    showIngredients.value = !showIngredients.value;
};
</script>

<style scoped>
.recipe-preview {
    max-width: 414px;
    margin: 0 auto 20px;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.recipe-content {
    display: flex;
    align-items: center;
    padding: 16px;
}

.image-container {
    width: 80px;
    height: 80px;
    border-radius: 12px;
    overflow: hidden;
    margin-right: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.text-content {
    flex: 1;
}

ion-card-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 4px;
}

ion-card-subtitle {
    font-size: 14px;
    line-height: 1.4;
    color: var(--ion-color-medium);
    margin-bottom: 8px;
}

.recipe-meta {
    display: flex;
    justify-content: flex-start;
}

.recipe-meta ion-chip {
    margin-right: 8px;
    font-size: 12px;
    height: 24px;
}

ion-card-content {
    padding-top: 0;
}

ion-button {
    margin-top: 8px;
}

ion-list {
    margin-top: 8px;
}

ion-item {
    --padding-start: 0;
    --inner-padding-end: 0;
}

ion-label {
    font-size: 14px;
}
</style>
