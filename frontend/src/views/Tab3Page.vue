<template>
  <ion-page>
    <SearchComponent titel="Discounts"></SearchComponent>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage } from '@ionic/vue';
import  SearchComponent from '@/components/SearchComponent.vue'

export default defineComponent({
  titel: 'Search',
  components: {   IonPage, SearchComponent }
});
</script>
