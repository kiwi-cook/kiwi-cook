<!--
  - Copyright (c) 2023 Josef Müller.
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
import { useSharedStore } from '@/shared/storage';

// Initialize the app store
const store = useSharedStore()
store.setLanguage()

// Initialize the recipe store
const recipeStore = useRecipeStore();
setTimeout(() => {
    recipeStore.prepareStore()
}, 0)

// Initialize the dark theme
prepareThemeColor()
</script>