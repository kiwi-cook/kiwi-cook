<!--
  - Copyright (c) 2023 Josef Müller.
  -->

<!-- A simple timer that can be used to show the remaining time for a recipe -->
<template>
    <IonFab slot="fixed" :horizontal="horizontal" vertical="bottom">
        <IonFabButton v-if="timer" color="primary" translucent>
            {{ strTimer }}
        </IonFabButton>
        <IonFabList side="top">
            <IonFabButton color="tertiary" @click="restartTimer">
                <IonIcon :icon="refreshOutline"/>
            </IonFabButton>
            <IonFabButton color="danger" @click="stopTimer">
                <IonIcon :icon="closeOutline"/>
            </IonFabButton>
            <IonFabButton v-if="!noRouting" color="tertiary" @click="toRecipe">
                <IonIcon :icon="arrowForwardOutline"/>
            </IonFabButton>
        </IonFabList>
    </IonFab>
</template>

<script lang="ts" setup>
import {IonFab, IonFabButton, IonFabList, IonIcon, useIonRouter} from '@ionic/vue';
import {useTasteBuddyStore} from '@/app/storage';
import {computed, PropType} from 'vue';
import {arrowForwardOutline, closeOutline, refreshOutline} from 'ionicons/icons';

defineProps({
    horizontal: {
        type: String as PropType<'start' | 'end'>,
        required: false,
        default: 'end'
    },
    noRouting: {
        type: Boolean,
        required: false,
        default: false
    }
})

const router = useIonRouter()
const store = useTasteBuddyStore()
const timer = computed(() => store.timer)
const pad = (n: number) => n < 10 ? `0${n}` : n;
const strTimer = computed(() => {
    const remaining = timer?.value?.remaining
    if (!remaining) {
        return '00:00:00'
    }

    const h = Math.floor(remaining / 3600);
    const m = Math.floor(remaining / 60) - (h * 60);
    const s = Math.floor(remaining - h * 3600 - m * 60);

    let str = '';
    if (h > 0) {
        str += `${pad(h)}:`
    }
    str += `${pad(m)}:${pad(s)}`

    return str
})
const toRecipe = () => {
    if (!timer?.value?.recipeId) {
        return
    }
    router.push(`/recipe/show/${timer?.value?.recipeId}`)
}

const restartTimer = () => store.resetTimer()
const stopTimer = () => store.stopTimer()
</script>

<style scoped>
ion-fab {
    --background: var(--ion-color-primary);
}

ion-fab-button::part(native) {
    font-weight: bold;
}
</style>