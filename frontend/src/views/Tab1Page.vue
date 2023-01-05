<template>
  <ion-page>
      <DetailedRecipeComponent titel="DetailRecipe" />
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage} from '@ionic/vue';
import DetailedRecipeComponent from '@/components/DetailedRecipeComponent.vue';


export default defineComponent({
  titel: 'Tab1Page',
  components: { DetailedRecipeComponent, IonPage }
});
</script>
