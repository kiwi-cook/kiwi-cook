<template>
    <div class="recipe-wrapper">
        <div class="recipe-hero-wrapper">
            <RecipeHero :no-description="true" :recipe="recipe" :routable="false"/>
        </div>

        <h2>Description</h2>
        <IonText class="recipe-description">
            {{ recipe?.description }}
        </IonText>

        <IonText v-if="itemsFromRecipe.length > 0" lines="none">
            <h2>What you'll need</h2>
        </IonText>

        <TwoColumnLayout v-if="itemsFromRecipe.length > 0" size="12" size-lg="6">
            <template #left>
                <IonCard>
                    <IonCardContent>
                        <IonItem class="servings-counter" lines="none">
                            <IonInput v-model="servings" label="Servings" label-placement="end" max="15"
                                      min="1"
                                      type="number"/>
                        </IonItem>
                        <ItemList :disable-click="true" :items="itemsFromRecipe" :type="['ingredient']"/>
                    </IonCardContent>
                </IonCard>
            </template>
            <template #right>
                <IonCard v-if="amountTools !== 0">
                    <IonCardContent>
                        <ItemList :disable-click="true" :items="itemsFromRecipe" :type="['tool']"/>
                    </IonCardContent>
                </IonCard>
            </template>
        </TwoColumnLayout>

        <IonText v-if="steps?.length > 0" lines="none">
            <h2>How to make it!</h2>
        </IonText>
        <template v-for="(step, stepIndex) in steps" :key="stepIndex">
            <RecipeStep :max-step-index="steps.length" :step="step" :stepIndex="stepIndex"/>
        </template>

        <IonItem lines="none">
            <IonNote>
                Recipe from {{ recipe?.getAuthors() ?? 'unknown' }}
                <template v-if="recipe?.source?.url">on <a :href="recipe?.source?.url"
                                                           target="_blank">{{ recipe?.source?.url }}</a>
                </template>
            </IonNote>
        </IonItem>
    </div>
</template>

<script lang="ts">
import {computed, ComputedRef, defineComponent, PropType, ref, toRefs, watch} from 'vue';
import {IonCard, IonCardContent, IonInput, IonItem, IonNote, IonText} from '@ionic/vue';
import {flagOutline, heart, heartOutline} from 'ionicons/icons';
import {Recipe, Step, StepItem} from '@/tastebuddy/types';
import RecipeHero from "@/components/recipe/RecipeHero.vue";
import RecipeStep from "@/components/recipe/RecipeStep.vue";
import ItemList from "@/components/recipe/ItemList.vue";
import TwoColumnLayout from "@/components/layout/TwoColumnLayout.vue";

export default defineComponent({
    title: 'Recipe',
    props: {
        recipe: {
            type: Object as PropType<Recipe>,
            required: true,
        },
    },
    components: {
        TwoColumnLayout,
        ItemList,
        RecipeHero,
        RecipeStep,
        IonItem,
        IonText,
        IonCard,
        IonCardContent,
        IonInput,
        IonNote
    },
    setup(props: any) {
        const {recipe} = toRefs(props);

        const itemsFromRecipe: ComputedRef<StepItem[]> = computed(() => recipe.value?.getStepItems() ?? []);
        const amountIngredients = computed(() => itemsFromRecipe.value.reduce((acc, item) => acc + (item.type === 'ingredient' ? 1 : 0), 0))
        const amountTools = computed(() => itemsFromRecipe.value.reduce((acc, item) => acc + (item.type === 'tool' ? 1 : 0), 0))
        const steps: ComputedRef<Step[]> = computed(() => recipe.value?.steps ?? [])

        const servings = ref(1)
        watch(servings, (newServings, oldServings) => {
            if (newServings !== oldServings) {
                recipe.value?.updateServings(newServings);
            }
        });

        return {
            // recipe
            servings,
            // steps
            steps,
            // items
            itemsFromRecipe, amountIngredients, amountTools,
            // icons
            heart, heartOutline, flagOutline,
        };
    },
});
</script>

<style scoped>
.recipe-wrapper {
    width: 100%;
    margin: var(--margin);
}

.recipe-description {
    white-space: pre-wrap;
    color: var(--ion-color-medium);
    font-size: var(--font-size-small);
}

.servings-counter {
    max-width: 150px;
}
</style>