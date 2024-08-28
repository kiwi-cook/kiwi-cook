<!--
  - Copyright (c) 2023-2024 Josef Müller.
  -->

<!-- A simple timer that can be used to show the remaining time for a recipe -->
<template>
    <IonFab slot="fixed" :horizontal="horizontal" vertical="bottom">
        <IonFabButton color="primary" translucent>
            {{ timers.length }}
            <IonIcon :icon="timeOutline"/>
        </IonFabButton>
        <IonFabList side="top">
            <template v-for="timer in timers" :key="timer.key">
                <IonFabButton color="primary" translucent @click="timerStore.resetTimer(timer.key)">
                    {{ timer.timeAsString }}
                </IonFabButton>
            </template>
        </IonFabList>
    </IonFab>
</template>

<script lang="ts" setup>
import { IonFab, IonFabButton, IonFabList, IonIcon } from '@ionic/vue';
import { PropType } from 'vue';
import { timeOutline } from 'ionicons/icons';
import { useTimerStore } from '@/app/storage/timer.ts';
import { storeToRefs } from 'pinia';

defineProps({
    horizontal: {
        type: String as PropType<'start' | 'end'>, required: false, default: 'end'
    }, noRouting: {
        type: Boolean, required: false, default: false
    }
})

const timerStore = useTimerStore()
const { timers } = storeToRefs(timerStore)
</script>

<style scoped>
ion-fab {
    --background: var(--ion-color-primary);
}

ion-fab-button::part(native) {
    font-weight: bold;
}
</style>
