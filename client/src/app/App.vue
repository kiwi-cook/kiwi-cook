<template>
    <IonApp>
        <IonRouterOutlet/>
    </IonApp>
</template>

<script lang="ts" setup>
import {prefersDark, toggleDarkTheme} from "@/shared/ts";
import {useRecipeStore, useTasteBuddyStore} from '@/app/storage';
import {DEFAULT_LOCALE} from "@/shared/locales/i18n.ts";
import {IonApp, IonRouterOutlet} from "@ionic/vue";

// Initialize the app store
setTimeout(() => {
    const store = useTasteBuddyStore()
    store.setLanguage(DEFAULT_LOCALE)
}, 0);

// Initialize the recipe store
const recipeStore = useRecipeStore();

setTimeout(() => {
    recipeStore.prepare()
}, 0)

// Theme
toggleDarkTheme(prefersDark.matches);
</script>