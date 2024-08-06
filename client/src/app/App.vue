<!--
  - Copyright (c) 2023-2024 Josef Müller.
  -->

<template>
    <IonApp>
        <IonRouterOutlet/>
    </IonApp>
</template>

<script lang="ts" setup>
import { useRecipeStore } from '@/app/storage';
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { prepareThemeColor } from '@/shared';
import { useLanguage } from '@/composables/useLanguage.ts';

// Initialize the language store
useLanguage();

// Initialize the recipe store
const recipeStore = useRecipeStore();
setTimeout(() => {
    recipeStore.prepareStore();
}, 0);

// Initialize the dark theme
prepareThemeColor();
</script>
