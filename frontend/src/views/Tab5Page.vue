<template>
  <ion-page>
      <LoginComponent></LoginComponent>
  </ion-page>
</template>
  
<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage } from '@ionic/vue';

import LoginComponent from '@/components/LoginComponent.vue';

export default defineComponent({
  name: 'Tab5Page',
  components: { LoginComponent, IonPage },

});
</script>
