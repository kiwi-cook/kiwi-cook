<template>
  <ion-page>
    <FridgeComponent titel="WhatsInYourFridge"></FridgeComponent>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage} from '@ionic/vue';
import FridgeComponent from '@/components/FridgeComponent.vue';


export default defineComponent({
  titel: 'Tab2Page',
  components: { FridgeComponent, IonPage }
});
</script>
