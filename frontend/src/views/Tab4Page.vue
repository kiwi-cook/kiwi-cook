<template>
  <ion-page>
    <ShoppingComponentVue titel="Discounts"></ShoppingComponentVue>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage} from '@ionic/vue';
import ShoppingComponentVue from '@/components/ShoppingComponent.vue';

export default defineComponent({
  titel: 'Discounts',
  components: { ShoppingComponentVue, IonPage }
});
</script>
