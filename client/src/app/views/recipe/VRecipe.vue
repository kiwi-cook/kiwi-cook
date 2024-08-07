<!--
  - Copyright (c) 2023-2024 Josef Müller.
  -->

<template>
    <IonPage v-disable-swipe-back>
        <IonHeader v-if="recipe" :translucent="true" class="ion-no-border" collapse="fade">
            <IonToolbar>
                <IonTitle class="content-margin">
                    <!-- Title -->
                    {{ recipe.getName() }}
                </IonTitle>
            </IonToolbar>
        </IonHeader>
        <IonContent :fullscreen="true">
            <div class="content-wrapper">
                <div class="content">
                    <div class="content-margin">
                        <template v-if="recipe">
                            <RecipeComponent :no-title="true" :recipe="recipe">
                                <template #title>
                                    <IonHeader class="ion-no-border">
                                        <IonToolbar class="ion-no-padding">
                                            <div class="content-margin ion-no-padding">
                                                <RecipeTitle :recipe="recipe"/>
                                            </div>
                                        </IonToolbar>
                                    </IonHeader>
                                </template>
                            </RecipeComponent>
                        </template>
                        <template v-else>
                            <IonText>
                                <h1>{{ $t("Recipe.NotFound.Title") }}</h1>
                            </IonText>
                            <IonText>
                                <p>{{ $t("Recipe.NotFound.Description") }}</p>
                            </IonText>
                            <IonButton @click="goBack()">
                                <IonIcon :icon="arrowBack"/>
                                {{ $t("Recipe.NotFound.Back") }}
                            </IonButton>
                        </template>
                    </div>
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
import {
    IonButton,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonPage,
    IonText,
    IonTitle,
    IonToolbar,
    useIonRouter
} from '@ionic/vue';
import { useRecipeStore } from '@/app/storage';
import { useRoute } from 'vue-router';
import { Recipe } from '@/shared';
import { arrowBack } from 'ionicons/icons';
import RecipeComponent from '@/app/components/recipe/Recipe.vue';
import FabTimer from '@/shared/components/time/FabTimer.vue';
import { RecipeTitle } from '@/app/components';

const route = useRoute();
const store = useRecipeStore();
const recipe = computed<Recipe>(() => {
    const recipeId = (route.params.id ?? '') as string;
    return store.recipeMap[recipeId];
});

const router = useIonRouter();
const goBack = () => router.back();
</script>
