<template>
    <IonPage id="recipe-editor-page">
        <IonContent :fullscreen="true">
            <div class="page">
                <div class="content">
                    <FancyHeader :big-text="['Recipe', 'Editor']"/>
                    <RecipeEditor v-if="recipe" :key="recipe?.getId()" :recipe="recipe"/>
                </div>
            </div>
            <IonFab slot="fixed" horizontal="start" vertical="bottom">
                <IonFabButton>
                    <IonIcon :icon="chevronForwardCircle"/>
                </IonFabButton>
                <IonFabList side="end">
                    <IonFabButton color="primary" @click="goBack()">
                        <IonIcon :icon="arrowBack"/>
                    </IonFabButton>
                    <IonFabButton color="primary" @click="addRecipe()">
                        <IonIcon :icon="addOutline"/>
                    </IonFabButton>
                    <IonFabButton color="primary" @click="recipe.save()">
                        <IonIcon :icon="saveOutline"/>
                    </IonFabButton>
                </IonFabList>
            </IonFab>
        </IonContent>
    </IonPage>
</template>

<script setup lang="ts">
import {computed, ComputedRef, ref, watch} from 'vue';
import {useRoute} from 'vue-router';
import {IonContent, IonFab, IonFabButton, IonFabList, IonIcon, IonPage, useIonRouter} from '@ionic/vue';
import {Recipe} from '@/tastebuddy';
import {useRecipeStore} from '@/storage';
import RecipeEditor from "@/components/editor/RecipeEditor.vue";
import {addOutline, arrowBack, chevronForwardCircle, saveOutline} from "ionicons/icons";
import FancyHeader from "@/components/utility/fancy/FancyHeader.vue";

const route = useRoute();
const recipeId = ref(route.params.id as string);
const store = useRecipeStore();
const recipe: ComputedRef<Recipe> = computed(() => store.getRecipesAsMap[recipeId.value]);
const mutableRecipe = ref<Recipe>(recipe.value);

watch(recipe, (newRecipe) => {
    mutableRecipe.value = newRecipe;
})

const router = useIonRouter()
const addRecipe = () => {
    const newRecipeId = Recipe.newRecipe().update().tmpId
    router.push({name: 'RecipeEditor', params: {id: newRecipeId}})
}
const goBack = () => router.back()
</script>