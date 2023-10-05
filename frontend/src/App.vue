<template>
    <IonApp>
        <IonRouterOutlet />
    </IonApp>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { prefersDark, toggleDarkTheme } from "@/tastebuddy";
import { useRecipeStore } from '@/storage';

const recipeStore = useRecipeStore();

// Initialize the recipe store
recipeStore.prepare()

// Theme
toggleDarkTheme(prefersDark.matches);
</script>