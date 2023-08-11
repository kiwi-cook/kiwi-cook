<template>
    <div class="recipe-preview-card">
        <RecipeHero :recipe="recipe" :routable="true"/>

        <IonItem v-if="items.length > 0" lines="none">
            <IonText>
                <h2>What You'll Need</h2>
            </IonText>
        </IonItem>

        <TwoColumnLayout>
            <template #left>
                <ItemList key="ingredient" :items="items" :type="['ingredient']"/>
            </template>
            <template #right>
                <ItemList key="tool" :items="items" :type="['tool']"/>
            </template>
        </TwoColumnLayout>
    </div>
</template>

<script lang="ts">
import {computed, ComputedRef, defineComponent, PropType, toRefs} from "vue";
import {Recipe, Step} from "@/tastebuddy";
import {IonItem, IonText, useIonRouter} from "@ionic/vue";
import RecipeHero from "@/components/recipe/RecipeHero.vue";
import ItemList from "@/components/recipe/ItemList.vue";
import TwoColumnLayout from "@/components/layout/TwoColumnLayout.vue";

export default defineComponent({
    name: 'RecipePreview',
    props: {
        recipe: {
            type: Object as PropType<Recipe>,
            required: true
        },
        noDescription: {
            type: Boolean,
            default: false
        }
    },
    components: {
        IonItem, IonText,
        TwoColumnLayout,
        ItemList,
        RecipeHero
    },
    setup(props: any) {
        const {recipe} = toRefs(props)
        const firstStep: ComputedRef<Step | undefined> = computed(() => recipe.value?.steps[0])
        const items = computed(() => recipe.value?.getStepItems() ?? [])

        const router = useIonRouter();
        const toRecipe = () => {
            router.push({name: 'Recipe', params: {id: recipe.value?.getId()}})
        }

        return {
            firstStep, items,
            toRecipe
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
    border-radius: 8px;
    padding: 16px;
    margin: 16px;
    box-shadow: var(--box-shadow);
}

.recipe-step-preview {
    margin-top: 16px;
    color: var(--ion-color-light);
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