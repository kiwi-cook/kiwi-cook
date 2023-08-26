<template>
    <IonApp>
        <IonRouterOutlet/>
    </IonApp>
    <IonText>
        Made with ♥️ by Josef & Vasilij
    </IonText>
</template>

<script setup lang="ts">
import {IonApp, IonRouterOutlet, IonText} from '@ionic/vue';
import {useRecipeStore} from './storage';
import {prefersDark, toggleDarkTheme} from "@/tastebuddy";

const recipeStore = useRecipeStore();

// Initialize the recipe store
recipeStore.prepare()

// Theme
toggleDarkTheme(prefersDark.matches);
</script>