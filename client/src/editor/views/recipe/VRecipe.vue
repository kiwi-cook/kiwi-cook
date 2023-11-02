<template>
    <IonPage>
        <IonHeader :translucent="true">
            <IonToolbar>
                <div class="ion-padding">
                    <!-- Navigation -->
                    <IonButtons>
                        <IonButton @click="addRecipe()">
                            <IonIcon :icon="addOutline"/>
                            Add Recipe
                        </IonButton>
                        <IonButton @click="parseRecipes()">
                            <IonIcon :icon="colorWand"/>
                            Parse Recipes
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
import {addOutline, colorWand} from 'ionicons/icons';
import {MutableRecipe} from '@/editor/types/recipe.ts';

const router = useIonRouter()
const addRecipe = () => {
    const newRecipeId = MutableRecipe.newRecipe().update().getId()
    router.push({name: 'RecipeEditor', params: {id: newRecipeId}})
}
const parseRecipes = () => {
    router.push({name: 'RecipeParser'})
}
</script>