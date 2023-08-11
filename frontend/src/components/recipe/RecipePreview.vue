<template>
    <div class="recipe-preview-card">
        <RecipeHero :recipe="recipe" :routable="true"/>

        <IonText v-if="items.length > 0" lines="none">
            <h2>What you'll need</h2>
        </IonText>

        <TwoColumnLayout v-if="items.length > 0" size="12" size-lg="6">
            <template #left>
                <IonCard>
                    <IonCardHeader>
                        <IonCardTitle>
                            <h3>
                                Ingredients
                            </h3>
                        </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <ItemList key="ingredient" :items="items" :type="['ingredient']"/>
                    </IonCardContent>
                </IonCard>
            </template>
            <template #right>
                <IonCard>
                    <IonCardHeader>
                        <IonCardTitle>
                            <h3>
                                Tools
                            </h3>
                        </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <ItemList key="tool" :items="items" :type="['tool']"/>
                    </IonCardContent>
                </IonCard>
            </template>
        </TwoColumnLayout>
    </div>
</template>

<script lang="ts">
import {computed, defineComponent, PropType, toRefs} from "vue";
import {Recipe} from "@/tastebuddy";
import {IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonText} from "@ionic/vue";
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
        IonCardTitle, IonCard, IonCardHeader, IonCardContent,
        IonText,
        TwoColumnLayout,
        ItemList,
        RecipeHero
    },
    setup(props: any) {
        const {recipe} = toRefs(props)
        const items = computed(() => recipe.value?.getStepItems() ?? [])

        return {
            items
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