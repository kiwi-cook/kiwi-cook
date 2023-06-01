<template>
    <ion-card class="recipe-preview-card">
        <RecipeHero :recipe="recipe" class="recipe-preview-hero"/>
        <ion-card-content>
            <SmallItemList :items="recipe.getItems()"/>
            <div v-if="firstStep?.description" class="recipe-step-preview">
                <p>
                    <strong>Step 1</strong>
                    {{ firstStep?.getShortDescription() }}
                </p>
                ...
            </div>
            <RecipeLink :recipe="recipe">
                View Full Recipe
            </RecipeLink>
        </ion-card-content>
    </ion-card>
</template>

<script lang="ts">
import {computed, ComputedRef, defineComponent, PropType, toRefs} from "vue";
import {Recipe, Step} from "@/tastebuddy/types";
import {IonCard, IonCardContent} from "@ionic/vue";
import RecipeHero from "@/components/recipe/RecipeHero.vue";
import RecipeLink from "@/components/recipe/RecipeLink.vue";
import SmallItemList from "@/components/item/SmallItemList.vue";

export default defineComponent({
    name: 'RecipePreview',
    props: {
        recipe: {
            type: Object as PropType<Recipe>,
            required: true
        }
    },
    components: {
        SmallItemList,
        RecipeHero, RecipeLink,
        IonCard, IonCardContent
    },
    setup(props: any) {
        const {recipe} = toRefs(props)
        const firstStep: ComputedRef<Step | undefined> = computed(() => recipe.value?.steps[0])
        return {
            firstStep
        }
    }
});
</script>

<!-- Use this to override the default styles -->
<style>
/* Override hero styles */
.recipe-preview-hero {
    height: 400px;
    border-radius: 0;
}

/* Is used in the RecipeHero component */
.recipe-preview-hero .hero-image::part(image) {
    border-radius: 0;
}
</style>

<style scoped>
.recipe-preview-card {
    --background: var(--ion-color-light-shade);
    --color: var(--ion-color-dark);
    --border-radius: 8px;
    --box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
    --padding: 16px;
    --margin: 16px;
    --ion-button-color: #FFF;
    --ion-button-background-color: #F28705;
}

.recipe-step-preview {
    margin-top: 16px;
}

.recipe-preview-card ion-card-content {
    padding: var(--padding);
}

.recipe-preview-card ion-card-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--ion-button-background-color);
}

.recipe-preview-card p {
    margin-top: 16px;
    font-size: 16px;
    line-height: 1.5;
}

.recipe-preview-card ion-button {
    margin-top: 16px;
    border-radius: 999px;
    text-transform: uppercase;
    font-weight: 600;
    --background: var(--ion-button-background-color);
    --color: var(--ion-button-color);
}
</style>