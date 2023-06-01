<template>
    <ion-list lines="none">
        <ion-item lines="none" v-if="recipe">
            <RecipeHero :recipe="recipe" />
        </ion-item>
        <ion-item lines="none" v-if="recipe">
            <div class="center">
                <ion-button color="primary">
                    {{ recipe?.props.likes ?? 0 }}
                    <ion-icon :aria-valuetext="`${recipe?.props.likes ?? 0} people like this`" :icon="heart" />
                </ion-button>
                <ion-button v-if="canShareRecipe" color="primary" @click="shareRecipe()">
                    <ion-icon slot="icon-only" :icon="shareOutline" aria-valuetext="Share Recipe" />
                </ion-button>
            </div>
        </ion-item>
    </ion-list>

    <ion-item v-if="ingredients.length > 0 || tools.length > 0" lines="none">
        <ion-text color="primary">
            <h1 class="recipe-subheader">Ingredients and Equipment</h1>
        </ion-text>
    </ion-item>

    <ion-grid v-if="ingredients.length > 0 || tools.length > 0">
        <ion-row>
            <ion-col size-lg="6" size="12">
                <ion-card v-if="ingredients?.length > 0">
                    <ion-card-header>
                        <ion-card-title color="light">
                            Ingredients
                        </ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                        <SmallItemList :items="ingredients" />
                    </ion-card-content>
                </ion-card>
            </ion-col>

            <ion-col size-lg="6" size="12">
                <ion-card v-if="tools?.length > 0">
                    <ion-card-header>
                        <ion-card-title color="light">
                            Equipment
                        </ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                        <SmallItemList :items="tools" />
                    </ion-card-content>
                </ion-card>
            </ion-col>
        </ion-row>
    </ion-grid>

    <ion-item v-if="steps?.length > 0" lines="none">
        <ion-text color="primary">
            <h1 class="recipe-subheader">Steps</h1>
        </ion-text>
    </ion-item>
    <template v-for="(step, stepIndex) in steps" :key="stepIndex">
        <RecipeStep :step="step" :stepIndex="stepIndex" />
    </template>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, PropType, ref, toRefs } from 'vue';
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonIcon,
    IonItem,
    IonList,
    IonText,
    IonGrid, IonRow, IonCol
} from '@ionic/vue';
import { flagOutline, heart, shareOutline } from 'ionicons/icons';
import { Item, Recipe, Step, StepItem } from '@/tastebuddy/types';
import RecipeHero from "@/components/recipe/RecipeHero.vue";
import RecipeStep from "@/components/recipe/step/RecipeStep.vue";
import SmallItemList from "@/components/item/SmallItemList.vue";
import { CanShareResult, Share } from '@capacitor/share';

export default defineComponent({
    title: 'Recipe',
    props: {
        recipe: {
            type: Object as PropType<Recipe>,
            required: true,
        },
    },
    components: {
        SmallItemList,
        RecipeHero, RecipeStep,
        IonIcon, IonButton, IonItem, IonList, IonText, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonGrid, IonRow, IonCol
    },
    setup(props: { recipe: Recipe }) {
        const { recipe } = toRefs(props);

        const itemsFromRecipe: ComputedRef<StepItem[]> = computed(() => recipe.value?.getStepItems() ?? []);
        const ingredients: ComputedRef<StepItem[]> = computed(() => itemsFromRecipe.value.filter(item => item.type === 'ingredient'))
        const tools: ComputedRef<Item[]> = computed(() => itemsFromRecipe.value.filter(item => item.type === 'tool'));
        const steps: ComputedRef<Step[]> = computed(() => recipe.value?.steps ?? [])

        // share
        const shareRecipe = () => recipe.value?.share();
        // check if the browser supports sharing
        const canShareRecipe = ref(false);
        Share.canShare().then((canShareResult: CanShareResult) => {
            canShareRecipe.value = canShareResult.value;
        });

        return {
            // recipe
            // steps
            steps,
            // items
            ingredients, tools,
            // share
            canShareRecipe, shareRecipe, shareOutline,
            // icons
            heart, flagOutline,
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