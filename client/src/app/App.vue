<template>
    <IonApp>
        <IonRouterOutlet/>
    </IonApp>
</template>

<script lang="ts" setup>
import {useRecipeStore, useTasteBuddyStore} from '@/app/storage';
import {DEFAULT_LOCALE} from '@/shared/locales/i18n.ts';
import {IonApp, IonRouterOutlet} from '@ionic/vue';
import {prepareThemeColor} from '@/shared/ts/theme.ts';

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

// Initialize the dark theme
prepareThemeColor()
</script>