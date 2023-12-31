<!--
  - Copyright (c) 2023 Josef Müller.
  -->

<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div class="content-wrapper">
                <div class="content">
                    <template v-if="recipe">
                        <RecipeComponent :recipe="recipe"/>
                    </template>
                    <template v-else>
                        <IonText>
                            <h1>{{ $t('Recipe.NotFound.Title') }}</h1>
                        </IonText>
                        <IonText>
                            <p>{{ $t('Recipe.NotFound.Description') }}</p>
                        </IonText>
                    </template>
                </div>
            </div>
            <IonFab slot="fixed" horizontal="start" vertical="bottom">
                <IonFabButton color="primary" @click="goBack()">
                    <IonIcon :icon="arrowBack"/>
                </IonFabButton>
            </IonFab>
            <FabTimer no-routing/>
        </IonContent>
    </IonPage>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { IonContent, IonFab, IonFabButton, IonIcon, IonPage, IonText, useIonRouter } from '@ionic/vue';
import { useRecipeStore } from '@/app/storage';
import { useRoute } from 'vue-router';
import { Recipe } from '@/shared';
import { arrowBack } from 'ionicons/icons';
import RecipeComponent from '@/app/components/recipe/Recipe.vue';
import FabTimer from '@/shared/components/utility/FabTimer.vue';

const route = useRoute()
const store = useRecipeStore()
const recipe = computed<Recipe>(() => {
    const recipeId = (route.params.id ?? '') as string
    return store.getRecipesAsMap[recipeId]
})

const router = useIonRouter()
const goBack = () => router.back()
</script>