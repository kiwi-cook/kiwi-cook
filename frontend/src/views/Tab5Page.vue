<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title :color="'dark'">Profil</ion-title>
        <ion-buttons slot="primary">
          <ion-button>
            <ion-icon slot="icon-only" :ios="ellipsisHorizontal" :md="ellipsisVertical"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 5</ion-title>
        </ion-toolbar>
      </ion-header>
      <LoginComponentVue titel="Lol" />
    </ion-content>
  </ion-page>
</template>
  
<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons } from '@ionic/vue';
import { ellipsisHorizontal, ellipsisVertical } from 'ionicons/icons';

import LoginComponentVue from '@/components/LoginComponent.vue';


export default defineComponent({
  titel: 'Tab5Page',
  components: { LoginComponentVue, IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonButton, IonIcon, IonButtons },

  setup() {
    return {
      ellipsisHorizontal, ellipsisVertical,
    };
  },
});
</script>

<style scoped>

</style>