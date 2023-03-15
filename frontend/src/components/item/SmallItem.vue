<template>
    <ion-item lines="none">
        <ion-avatar slot="start">
            <img :src="item.imgUrl" />
        </ion-avatar>
        <ion-label color="light">
            <h2>{{ item.name }}</h2>
        </ion-label>
    </ion-item>
</template>

<script lang="ts">
import { Item } from '@/api/types';
import { IonItem, IonAvatar, IonLabel } from '@ionic/vue';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'SmallRecipe',
  props: {
    item: {
      type: Object as PropType<Item>,
      required: true,
    },
  },
  components: {
    IonItem, IonAvatar, IonLabel
  }
});
</script>
