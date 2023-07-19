<template>
    <IonList lines="none">
        <IonItem v-if="recipe" lines="none">
            <RecipeHero :recipe="recipe" :routable="false"/>
        </IonItem>
        <IonItem v-if="recipe" lines="none">
            <div class="center">
                <IonButton v-if="canShareRecipe" color="primary" @click="shareRecipe()">
                    <IonIcon slot="icon-only" :icon="shareOutline" aria-valuetext="Share Recipe"/>
                </IonButton>
            </div>
        </IonItem>
    </IonList>

    <IonItem v-if="itemsFromRecipe.length > 0" lines="none">
        <IonText>
            <h1 class="recipe-subheader">What You'll Need</h1>
        </IonText>
    </IonItem>

    <TwoColumnLayout v-if="itemsFromRecipe.length > 0" size="12" size-lg="6">
        <template #left>
            <IonCard>
                <IonCardHeader>
                    <IonCardTitle>
                        Ingredients
                    </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                    <IonItem class="servings-counter">
                        <IonInput v-model="servings" label="Servings" label-placement="stacked" max="15"
                                  min="1"
                                  type="number"/>
                    </IonItem>
                    <ItemList :disable-click="true" :items="itemsFromRecipe" :type="['ingredient']"/>
                </IonCardContent>
            </IonCard>
        </template>
        <template #right>
            <IonCard>
                <IonCardHeader>
                    <IonCardTitle>
                        Equipment
                    </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                    <ItemList :disable-click="true" :items="itemsFromRecipe" :type="['tool']"/>
                </IonCardContent>
            </IonCard>
        </template>
    </TwoColumnLayout>

    <IonItem v-if="steps?.length > 0" lines="none">
        <IonText>
            <h1 class="recipe-subheader">How to Make It</h1>
        </IonText>
    </IonItem>
    <template v-for="(step, stepIndex) in steps" :key="stepIndex">
        <RecipeStep :step="step" :stepIndex="stepIndex"/>
    </template>
</template>

<script lang="ts">
import {computed, ComputedRef, defineComponent, PropType, ref, toRefs, watch} from 'vue';
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonIcon,
    IonInput,
    IonItem,
    IonList,
    IonText
} from '@ionic/vue';
import {flagOutline, heart, heartOutline, shareOutline} from 'ionicons/icons';
import {Recipe, Step, StepItem} from '@/tastebuddy/types';
import RecipeHero from "@/components/recipe/RecipeHero.vue";
import RecipeStep from "@/components/recipe/step/RecipeStep.vue";
import ItemList from "@/components/recipe/ItemList.vue";
import {CanShareResult, Share} from '@capacitor/share';
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
        IonIcon,
        IonButton,
        IonItem,
        IonList,
        IonText,
        IonCard,
        IonCardContent,
        IonCardHeader,
        IonCardTitle,
        IonInput
    },
    setup(props: any) {
        const {recipe} = toRefs(props);

        const itemsFromRecipe: ComputedRef<StepItem[]> = computed(() => recipe.value?.getItems() ?? []);
        const steps: ComputedRef<Step[]> = computed(() => recipe.value?.steps ?? [])

        const servings = ref(1)
        watch(servings, (newServings, oldServings) => {
            if (newServings !== oldServings) {
                recipe.value?.updateServings(newServings);
            }
        });

        // share
        const shareRecipe = () => recipe.value?.share();
        // check if the browser supports sharing
        const canShareRecipe = ref(false);
        Share.canShare().then((canShareResult: CanShareResult) => {
            canShareRecipe.value = canShareResult.value;
        })


        return {
            // recipe
            servings,
            // steps
            steps,
            // items
            itemsFromRecipe,
            // share
            canShareRecipe, shareRecipe, shareOutline,
            // icons
            heart, heartOutline, flagOutline,
        };
    },
});
</script>

<style scoped>
.recipe-subheader {
    margin-top: 2%;
    font-weight: bold;
}

.servings-counter {
    max-width: 100px;
}
</style>