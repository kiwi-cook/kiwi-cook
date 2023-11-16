<template>
    <IonApp>
        <IonRouterOutlet/>
    </IonApp>
</template>

<script lang="ts" setup>
import {useRecipeStore, useTasteBuddyStore} from '@/app/storage';
import {IonApp, IonRouterOutlet} from '@ionic/vue';
import {prepareThemeColor} from '@/shared';

// Initialize the app store
const store = useTasteBuddyStore()
store.setLanguage()

// Initialize the recipe store
const recipeStore = useRecipeStore();

setTimeout(() => {
    recipeStore.prepare()
}, 0)

// Initialize the dark theme
prepareThemeColor()
</script>