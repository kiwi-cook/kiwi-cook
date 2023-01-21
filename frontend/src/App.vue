<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { defineComponent } from 'vue';
import { useTasteBuddyStore } from './storage';

export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    IonRouterOutlet
  },
  setup () {
    // Initialize the store
    const store = useTasteBuddyStore();
    store.dispatch('fetchRecipes')
    store.dispatch('fetchItems')
    store.dispatch('fetchDiscounts')

    return {
    }
  }
});
</script>