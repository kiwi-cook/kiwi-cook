<!--
  - Copyright (c) 2023 Josef Müller.
  -->

<template>
    <IonChip v-if="temperature ?? 0 > 0">
        <IonIcon :icon="flame"/>
        <IonLabel>{{ temperature }} °C</IonLabel>
    </IonChip>
</template>

<script lang="ts" setup>
import { flame } from 'ionicons/icons';
import { IonChip, IonIcon, IonLabel } from '@ionic/vue';

defineProps({
    temperature: {
        type: Number, required: false
    }
})
</script>
