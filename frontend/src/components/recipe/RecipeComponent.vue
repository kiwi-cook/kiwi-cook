<template>
    <ion-list lines="none">
        <ion-item lines="none">
            <RecipeHero :recipe="recipe"/>
        </ion-item>
        <ion-item lines="none">
            <div class="center">
                <div id="HeartSaveShareButton">
                    <ion-button color="primary">
                        <ion-icon slot="icon-only" :icon="heart"></ion-icon>
                        {{ recipe?.likes }} Likes
                    </ion-button>
                    <ion-button color="primary">
                        <ion-icon slot="icon-only" :icon="flagOutline">Save</ion-icon>
                        Save
                    </ion-button>
                    <ion-button color="primary">
                        <ion-icon slot="icon-only" :icon="shareOutline" aria-valuetext="Share Recipe"></ion-icon>
                    </ion-button>
                </div>
            </div>
        </ion-item>
    </ion-list>

    <ion-item lines="none">
        <ion-text color="primary">
            <h1 class="recipe-subheader">Ingredients 🥕 and Equipment 🔪</h1>
        </ion-text>
    </ion-item>
    <ion-card v-if="ingredients?.length > 0">
        <ion-card-header>
            <ion-card-title color="light">
                Ingredients
            </ion-card-title>
        </ion-card-header>
        <ion-card-content>
            <SmallItemContainer :items="ingredients"/>
        </ion-card-content>
    </ion-card>

    <ion-card v-if="equipment?.length > 0">
        <ion-card-header>
            <ion-card-title color="light">
                Equipment
            </ion-card-title>
        </ion-card-header>
        <ion-card-content>
            <SmallItemContainer :items="equipment"/>
        </ion-card-content>
    </ion-card>

    <!-- <ion-card>
        <ion-card-header>
            <ion-card-title color="light">
                Nutritional Values
            </ion-card-title>
        </ion-card-header>
        <ion-card-content>
            <ion-item>

            </ion-item>
        </ion-card-content>
    </ion-card> -->

    <ion-item lines="none">
        <ion-text color="primary">
            <h1 class="recipe-subheader">Steps</h1>
        </ion-text>
    </ion-item>
    <template v-for="(step, stepIndex) in steps" :key="stepIndex">
        <StepComponent :step="step" :stepIndex="stepIndex"/>
    </template>

</template>

<script lang="ts">
import {computed, ComputedRef, defineComponent, PropType, toRefs} from 'vue';
import {IonButton, IonIcon, IonItem, IonList} from '@ionic/vue';
import {flagOutline, heart, shareOutline} from 'ionicons/icons';
import {Item, Recipe, Step, voilaStep} from '@/api/types';
import SmallItemContainer from '../item/SmallItemContainer.vue';
import RecipeHero from "@/components/recipe/RecipeHero.vue";
import StepComponent from "@/components/recipe/StepComponent.vue";

export default defineComponent({
    methods: {
        voilaStep() {
            return voilaStep
        }
    },
    title: 'RecipeComponent',
    props: {
        recipe: {
            type: Object as PropType<Recipe>,
            required: true,
        },
    },
    components: {
        RecipeHero, SmallItemContainer, StepComponent,
        IonIcon, IonButton, IonItem, IonList,
    },
    setup(props: any) {
        const {recipe} = toRefs(props);

        const itemsFromRecipe: ComputedRef<Item[]> = computed(() => recipe.value?.getItems());
        const ingredients: ComputedRef<Item[]> = computed(() => itemsFromRecipe.value)
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
#HeartSaveShareButton {
    margin-top: 2%;
}

.recipe-subheader {
    margin-top: 2%;
    font-weight: bold;
}

</style>