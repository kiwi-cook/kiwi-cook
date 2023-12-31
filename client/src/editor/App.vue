<!--
  - Copyright (c) 2023 Josef Müller.
  -->

<template>
    <IonApp>
        <IonRouterOutlet/>
    </IonApp>
</template>

<script lang="ts" setup>
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { prepareThemeColor } from '@/shared';
import { useRecipeEditorStore } from '@/editor/storage';
import { useRecipeStore } from '@/app/storage';

// Initialize the dark theme
prepareThemeColor()

// Initialize the recipe store
const recipeEditorStore = useRecipeEditorStore();
const recipeAppStore = useRecipeStore();

setTimeout(() => {
    recipeAppStore.prepareStore().then(() => {
        recipeEditorStore.prepare()
    })
}, 0)
</script>