<template>
    <IonPage id="recipe-editor-page">
        <IonContent :fullscreen="true">
            <div class="content-wrapper">
                <div class="content">
                    <Header :big-text="['Recipe', 'Editor']"/>
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

<script lang="ts" setup>
import {computed, ref} from 'vue';
import {useRoute} from 'vue-router';
import {IonContent, IonFab, IonFabButton, IonFabList, IonIcon, IonPage, useIonRouter} from '@ionic/vue';
import {useRecipeStore} from '@/editor/storage';
import RecipeEditor from '@/editor/components/editor/RecipeEditor.vue';
import {addOutline, arrowBack, chevronForwardCircle, saveOutline} from 'ionicons/icons';
import Header from '@/shared/components/utility/header/Header.vue';
import {MutableRecipe} from '@/editor/types/recipe.ts';

const route = useRoute();
const recipeId = ref(route.params.id as string);
const store = useRecipeStore();
const recipe = computed<MutableRecipe>(() => store.getRecipesAsMap[recipeId.value] as MutableRecipe);

const router = useIonRouter()
const addRecipe = () => {
    const newRecipeId = MutableRecipe.newRecipe().update().getId()
    router.push({name: 'RecipeEditor', params: {id: newRecipeId}})
}
const goBack = () => router.back()
</script>