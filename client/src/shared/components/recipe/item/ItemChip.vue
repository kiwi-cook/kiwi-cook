<!--
  - Copyright (c) 2023-2024 Josef Müller.
  -->

<!-- Item as a chip that is suggested in the searchbar -->
<template>
    <IonChip v-if="item" :color="color" class="item-chip">
        <IonThumbnail :key="item.getName()" class="item-chip-thumbnail">
            <img :alt="item?.getName()" :src="item.imgUrl ?? ''" loading="lazy"/>
        </IonThumbnail>
        <IonLabel class="item-chip-label">
            {{ item?.getName() }}
        </IonLabel>
    </IonChip>
</template>

<script lang="ts" setup>
import { IonChip, IonLabel, IonThumbnail } from '@ionic/vue';
import { PropType, toRefs } from 'vue';
import { Ingredient } from '@/shared';

const props = defineProps({
    ingredient: {
        type: Object as PropType<Ingredient>, required: true,
    }, color: {
        type: String, required: false, default: 'primary'
    }
})
const { item } = toRefs(props);
</script>

<style scoped>
.item-chip {
    margin: 0 0.5rem 0.5rem 0;
}

.item-chip-thumbnail {
    --border-radius: 50%;
    width: 2rem;
    height: 2rem;
}

.item-chip-label {
    font-size: 0.8rem;
    padding: 0.2rem 0.5rem;
}

.item-chip-label::after {
    content: '';
    display: block;
    width: 100%;
    height: 0.1rem;
    background-color: var(--ion-color-primary);
    border-radius: 0.2rem;
    margin-top: 0.2rem;
}

.item-chip-label::after, .item-chip-label::before {
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
}
</style>
