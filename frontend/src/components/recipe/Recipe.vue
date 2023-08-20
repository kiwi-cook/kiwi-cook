<template>
    <div class="recipe-wrapper">
        <div class="recipe-hero-wrapper">
            <RecipeHero :no-description="true" :recipe="recipe" :routable="false"/>
        </div>

        <IonAccordionGroup :multiple="true" :value="['description', 'items', 'steps']" expand="inset">
            <IonAccordion value="description">
                <IonItem slot="header">
                    <h2>Description</h2>
                </IonItem>
                <div slot="content" class="ion-padding">
                    <IonText class="recipe-description">
                        <p>
                            {{ recipe?.getDescription() }}
                        </p>
                    </IonText>
                </div>
            </IonAccordion>

            <IonAccordion value="items">
                <IonItem slot="header">
                    <h2>What you'll need</h2>
                </IonItem>
                <div slot="content" class="ion-padding">
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
                </div>
            </IonAccordion>

            <IonAccordion value="steps">
                <IonItem slot="header">
                    <h2>How to make it</h2>
                </IonItem>
                <div slot="content" class="ion-padding">
                    <template v-for="(step, stepIndex) in steps" :key="stepIndex">
                        <RecipeStep :max-step-index="steps.length" :step="step" :stepIndex="stepIndex"/>
                    </template>
                </div>
            </IonAccordion>
        </IonAccordionGroup>

        <IonItem lines="none">
            <IonNote>
                <p v-html="source" />
            </IonNote>
        </IonItem>
    </div>
</template>

<script lang="ts">
import {computed, ComputedRef, defineComponent, PropType, ref, toRefs, watch} from 'vue';
import {
    IonAccordion,
    IonAccordionGroup,
    IonCard,
    IonCardContent,
    IonInput,
    IonItem,
    IonNote,
    IonText
} from '@ionic/vue';
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
        IonNote,
        IonAccordionGroup, IonAccordion
    },
    setup(props: any) {
        const {recipe} = toRefs(props);

        const itemsFromRecipe: ComputedRef<StepItem[]> = computed(() => recipe.value?.getStepItems() ?? []);
        const amountIngredients = computed(() => itemsFromRecipe.value.reduce((acc, item) => acc + (item.type === 'ingredient' ? 1 : 0), 0))
        const amountTools = computed(() => itemsFromRecipe.value.reduce((acc, item) => acc + (item.type === 'tool' ? 1 : 0), 0))
        const steps: ComputedRef<Step[]> = computed(() => recipe.value?.steps ?? [])

        const source = computed(() => {
            const authors = recipe.value?.getAuthors()
            const source = recipe.value?.source?.url
            const sourceTag = source ? `<a href="${source}" target="_blank">${source}</a>` : ''

            if (authors !== '' && source !== '') {
                return `Recipe by ${authors} on ${sourceTag}`
            } else if (source === '') {
                return `Recipe by ${authors}`
            } else if (authors === '') {
                return `Recipe on ${sourceTag}`
            } else {
                return ''
            }
        })

        const servings = ref(1)
        watch(servings, (newServings, oldServings) => {
            if (newServings !== oldServings) {
                recipe.value?.updateServings(newServings);
            }
        });

        return {
            // recipe
            servings, source,
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