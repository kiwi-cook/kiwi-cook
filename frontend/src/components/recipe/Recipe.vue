<template>
    <ion-list lines="none">
        <ion-item lines="none" v-if="recipe">
            <RecipeHero :recipe="recipe" />
        </ion-item>
        <ion-item lines="none">
            <div class="center">
                <ion-button color="primary">
                    {{ recipe?.props.likes ?? 0 }} <ion-icon :icon="heart"
                        :aria-valuetext="`${recipe?.props.likes ?? 0} people like this`" />
                </ion-button>
                <ion-button color="primary">
                    <ion-icon slot="icon-only" :icon="shareOutline" aria-valuetext="Share Recipe" />
                </ion-button>
            </div>
        </ion-item>
    </ion-list>

    <ion-item lines="none" v-if="ingredients?.length > 0 || equipment?.length > 0">
        <ion-text color="primary">
            <h1 class="recipe-subheader">Ingredients and Equipment</h1>
        </ion-text>
    </ion-item>
    <ion-card v-if="ingredients?.length > 0">
        <ion-card-header>
            <ion-card-title color="light">
                Ingredients
            </ion-card-title>
        </ion-card-header>
        <ion-card-content>
            <SmallItemContainer :items="ingredients" />
        </ion-card-content>
    </ion-card>

    <ion-card v-if="equipment?.length > 0">
        <ion-card-header>
            <ion-card-title color="light">
                Equipment
            </ion-card-title>
        </ion-card-header>
        <ion-card-content>
            <SmallItemContainer :items="equipment" />
        </ion-card-content>
    </ion-card>

    <!-- <ion-card>
        <ion-card-header>
            <ion-card-title >
                Nutritional Values
            </ion-card-title>
        </ion-card-header>
        <ion-card-content>
            <ion-item>

            </ion-item>
        </ion-card-content>
    </ion-card> -->

    <ion-item lines="none" v-if="steps?.length > 0">
        <ion-text color="primary">
            <h1 class="recipe-subheader">Steps</h1>
        </ion-text>
    </ion-item>
    <template v-for="(step, stepIndex) in steps" :key="stepIndex">
        <RecipeStep :step="step" :stepIndex="stepIndex" />
    </template>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, PropType, toRefs } from 'vue';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon, IonItem, IonList, IonText } from '@ionic/vue';
import { flagOutline, heart, shareOutline } from 'ionicons/icons';
import { Item, Recipe, Step, StepItem } from '@/api/types';
import SmallItemContainer from '../item/SmallItemContainer.vue';
import RecipeHero from "@/components/recipe/RecipeHero.vue";
import RecipeStep from "@/components/recipe/step/RecipeStep.vue";

export default defineComponent({
    title: 'Recipe',
    props: {
        recipe: {
            type: Object as PropType<Recipe>,
            required: true,
        },
    },
    components: {
        RecipeHero, SmallItemContainer, RecipeStep,
        IonIcon, IonButton, IonItem, IonList, IonText, IonCard, IonCardContent, IonCardHeader, IonCardTitle
    },
    setup(props: { recipe: Recipe }) {
        const { recipe } = toRefs(props);

        const itemsFromRecipe: ComputedRef<StepItem[]> = computed(() => recipe.value?.getStepItems());
        const ingredients: ComputedRef<StepItem[]> = computed(() => itemsFromRecipe.value)
        const equipment: ComputedRef<Item[]> = computed(() => []);
        const steps: ComputedRef<Step[]> = computed(() => recipe.value?.steps)

        return {
            ingredients, equipment, steps,
            heart, flagOutline, shareOutline
        };
    },
});
</script>

<style scoped>
.recipe-subheader {
    margin-top: 2%;
    font-weight: bold;
}
</style>