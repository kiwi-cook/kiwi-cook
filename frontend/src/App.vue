<template>
    <IonApp>
        <IonRouterOutlet/>
    </IonApp>
</template>

<script lang="ts">
import {IonApp, IonRouterOutlet} from '@ionic/vue';
import {defineComponent} from 'vue';
import {useTasteBuddyStore} from './storage';
import {logClick} from './tastebuddy';

export default defineComponent({
    name: 'App',
    components: {
        IonApp,
        IonRouterOutlet,
    },
    setup() {
        // Initialize the store
        const store = useTasteBuddyStore();
        store.fetchRecipes()
        store.fetchItems()

        // Use matchMedia to check the user preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

        // Listen for changes to the prefers-color-scheme media query
        prefersDark.addEventListener('change', (e) => {
            toggleDarkTheme(e.matches);
        });

        toggleDarkTheme(prefersDark.matches);

        // Add or remove the "dark" class based on if the media query matches
        function toggleDarkTheme(shouldAdd: boolean) {
            document.body.classList.toggle('dark', shouldAdd);
        }

        // Log everything
        document.getElementsByTagName('body')[0].addEventListener('click', (e) => {
            logClick(e.target)
        })
        return {}
    }
});
</script>