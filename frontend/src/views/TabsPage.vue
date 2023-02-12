<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet>

      </ion-router-outlet>
      <ion-tab-bar slot="bottom">

        <ion-tab-button tab="tab1" href="/tabs/tab1">
          <ion-icon :icon="fastFood" />
          <ion-label>Today</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab2" href="/tabs/tab2">
          <ion-icon :icon="playCircle" />
          <ion-label>How To</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab3" href="/tabs/tab3">
          <ion-icon :icon="search" />
          <ion-label>Search</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab4" href="/tabs/tab4">
          <ion-icon :icon="cart" />
          <ion-label>Shopping</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab5" href="/tabs/tab5">
          <ion-icon :icon="person" />
          <ion-label>Profil</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="editor" href="/tabs/editor">
          <ion-icon :icon="createOutline" />
          <ion-label>Editor</ion-label>
        </ion-tab-button>

      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet, } from '@ionic/vue';
import { ellipse, square, triangle, search, person, playCircle, cart, fastFood, createOutline } from 'ionicons/icons';

export default defineComponent({
  name: 'TabsPage',
  components: { IonLabel, IonTabs, IonTabBar, IonTabButton, IonIcon, IonPage, IonRouterOutlet },
  setup() {

    return {
      ellipse,
      square,
      triangle,
      search,
      person,
      playCircle,
      cart,
      fastFood,
      createOutline
    }
  }
});
</script>
