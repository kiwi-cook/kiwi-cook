<!--
  - Copyright (c) 2023-2024 Josef Müller.
  -->

<template>
    <IonPage>
        <IonHeader :translucent="true">
            <IonToolbar>
                <div class="ion-padding">
                    <!-- Navigation -->
                    <IonButtons>
                        <IonButton @click="goBack()">
                            <IonIcon :icon="arrowBack"/>
                            Back
                        </IonButton>
                        <IonButton @click="addRecipe()">
                            <IonIcon :icon="addOutline"/>
                            Add Recipe
                        </IonButton>
                        <IonButton @click="parseJSON()">
                            <IonIcon :icon="colorWand"/>
                            Parse JSON
                        </IonButton>
                        <IonButton @click="parseURL()">
                            <IonIcon :icon="colorWand"/>
                            Parse URL
                        </IonButton>
                    </IonButtons>
                </div>
            </IonToolbar>
        </IonHeader>
        <IonContent>
            <IonRouterOutlet/>
        </IonContent>
    </IonPage>
</template>

<script lang="ts" setup>
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonPage,
    IonRouterOutlet,
    IonToolbar,
    useIonRouter
} from '@ionic/vue';
import { addOutline, arrowBack, colorWand } from 'ionicons/icons';
import { MutableRecipe } from '@/editor/models/recipe';

const router = useIonRouter()

const goBack = () => router.back()
const addRecipe = () => {
    const newRecipeId = MutableRecipe.newRecipe().update().getId()
    router.push({ name: 'RecipeEditor', params: { id: newRecipeId } })
}
const parseJSON = () => {
    router.push({ name: 'RecipeJsonParser' })
}

const parseURL = () => {
    router.push({ name: 'RecipeUrlParser' })
}
</script>
