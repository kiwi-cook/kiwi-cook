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
import {computed} from 'vue';
import {IonContent, IonFab, IonFabButton, IonIcon, IonPage, useIonRouter} from '@ionic/vue';
import RecipeComponent from '@/app/components/recipe/Recipe.vue';
import {useRecipeStore} from "@/app/storage";
import {useRoute} from 'vue-router';
import {Recipe} from '@/shared';
import {arrowBack} from "ionicons/icons";


const route = useRoute()
const recipeId = computed<string>(() => (route.params.id ?? '') as string)

const store = useRecipeStore()
const recipe = computed<Recipe>(() => store.getRecipesAsMap[recipeId.value])

const router = useIonRouter()
const goBack = () => router.back()
</script>