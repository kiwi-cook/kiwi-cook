<!--
  - Copyright (c) 2023-2024 Josef Müller.
  -->

<!-- A simple timer that can be used to show the remaining time for a recipe -->
<template>
    <IonFab slot="fixed" :horizontal="horizontal" vertical="bottom">
        <IonFabButton v-if="numberOfTimers > 0" color="primary" translucent>
            {{ numberOfTimers }} timers
            <IonIcon :icon="timeOutline"/>
        </IonFabButton>
        <IonFabList side="top">
            <template v-for="(timer, timerKey) in timers" :key="timerKey">
                <IonFabButton color="primary" @click="resetTimer(timer.key)">
                    {{ timer.timeAsString }}
                    <IonIcon :icon="timeOutline"/>
                </IonFabButton>
            </template>
        </IonFabList>
    </IonFab>
</template>

<script lang="ts" setup>
import { IonFab, IonFabButton, IonFabList, IonIcon } from '@ionic/vue';
import { PropType } from 'vue';
import { timeOutline } from 'ionicons/icons';
import useTimer from '@/composables/useTimer.ts';

defineProps({
    horizontal: {
        type: String as PropType<'start' | 'end'>, required: false, default: 'end'
    }, noRouting: {
        type: Boolean, required: false, default: false
    }
})

const { timers, resetTimer, numberOfTimers } = useTimer()
</script>

<style scoped>
ion-fab {
    --background: var(--ion-color-primary);
}

ion-fab-button::part(native) {
    font-weight: bold;
}
</style>
