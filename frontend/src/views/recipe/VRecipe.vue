<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div class="page">
                <div v-if="recipe" class="content">
                    <RecipeComponent :recipe="recipe"/>
                </div>
            </div>
            <IonFab slot="fixed" horizontal="start" vertical="bottom">
                <IonFabButton color="primary" @click="goBack()">
                    <IonIcon :icon="arrowBack"/>
                </IonFabButton>
            </IonFab>
        </IonContent>
    </IonPage>
</template>

<script setup lang="ts">
import {computed, ComputedRef} from 'vue';
import {IonContent, IonFab, IonFabButton, IonIcon, IonPage, useIonRouter} from '@ionic/vue';
import RecipeComponent from '@/components/recipe/Recipe.vue';
import {useRecipeStore} from "@/storage";
import {useRoute} from 'vue-router';
import {head, Recipe, renderRecipeHead} from '@/tastebuddy';
import {arrowBack} from "ionicons/icons";


const route = useRoute()
const recipeId: ComputedRef<string> = computed(() => (route.params.id ?? '') as string)

const store = useRecipeStore()
const recipe: ComputedRef<Recipe> = computed(() => store.getRecipesAsMap[recipeId.value])

const router = useIonRouter()
const goBack = () => router.back()
renderRecipeHead(head, recipe.value)
</script>