<template>
    <div class="recipe-preview-card">
        <RecipeHero :recipe="recipe" :routable="true" :likable="false" :noDescription="true"/>

        <IonText v-if="items.length > 0" lines="none">
            <h2>What you'll need</h2>
        </IonText>

        <TwoColumnLayout v-if="items.length > 0" size="12" size-lg="6">
            <template #left>
                <IonCard class="no-border">
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
                <IonCard class="no-border">
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

<style scoped>
.recipe-preview-card {
    /* border: var(--border); */
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
}
</style>