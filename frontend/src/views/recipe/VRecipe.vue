<template>
    <IonPage id="recipe-detail-page">
        <IonContent :fullscreen="true">
            <div class="content">
                <template v-if="recipe">
                    <RecipeComponent :recipe="recipe"/>
                </template>
            </div>
            <IonFab slot="fixed" horizontal="start" vertical="bottom">
                <IonFabButton color="primary" @click="goBack()">
                    <IonIcon :icon="arrowBack"/>
                </IonFabButton>
            </IonFab>
        </IonContent>
    </IonPage>
</template>

<script lang="ts">
import {computed, ComputedRef, defineComponent} from 'vue';
import {IonContent, IonFab, IonFabButton, IonIcon, IonPage, useIonRouter} from '@ionic/vue';
import RecipeComponent from '@/components/recipe/Recipe.vue';
import {useRecipeStore} from "@/storage";
import {useRoute} from 'vue-router';
import {Recipe} from '@/tastebuddy';
import {addOutline, arrowBack, createOutline} from "ionicons/icons";


export default defineComponent({
    title: 'RecipeOfTheDayPage',
    components: {
        RecipeComponent,
        IonPage, IonContent, IonFabButton, IonIcon, IonFab,
    },
    setup() {
        const route = useRoute()
        const recipeId: ComputedRef<string> = computed(() => (route.params.id ?? '') as string)

        const store = useRecipeStore()
        const recipe: ComputedRef<Recipe> = computed(() => store.getRecipesAsMap[recipeId.value])


        const router = useIonRouter()
        const goBack = () => router.back()

        return {
            // recipe
            recipe, createOutline,
            // fab
            goBack, arrowBack, addOutline
        }
    }
});
</script>

<style scoped>
.gradient {
    background: linear-gradient(to bottom, #2F3540 0%, rgba(0, 0, 0, 0) 100%);
}
</style>