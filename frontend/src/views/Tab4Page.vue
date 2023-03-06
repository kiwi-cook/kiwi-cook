<template>
  <ion-page>
    <ShoppingComponent title="Discounts"></ShoppingComponent>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage} from '@ionic/vue';
import ShoppingComponent from '@/components/ShoppingComponent.vue';

export default defineComponent({
  name: 'DiscountsPage',
  components: { ShoppingComponent, IonPage }
});
</script>
