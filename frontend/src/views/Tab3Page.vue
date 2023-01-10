<template>
  <ion-page>
    <SearchComponent title="Discounts"></SearchComponent>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage } from '@ionic/vue';
import  SearchComponent from '@/components/SearchComponent.vue'

export default defineComponent({
  name: 'SearchTab',
  components: {   IonPage, SearchComponent }
});
</script>
