<!--
  - Copyright (c) 2023-2024 Josef Müller.
  -->

<template>
    <IonChip v-if="(duration ?? 0 > 0) || alwaysShow">
        <IonIcon v-if="!noIcon" :icon="time"/>
        <IonLabel>{{ normalDuration.duration }} {{ normalDuration.unit }}
            <slot/>
        </IonLabel>
    </IonChip>
</template>

<script lang="ts" setup>
import { time } from 'ionicons/icons';
import { IonChip, IonIcon, IonLabel } from '@ionic/vue';
import { computed, toRefs } from 'vue';

const props = defineProps({
    duration: {
        type: Number, required: false,
    }, alwaysShow: {
        type: Boolean, required: false, default: false,
    }, noIcon: {
        type: Boolean, required: false, default: false,
    },
});

const { duration } = toRefs(props);

const normalDuration = computed<{ duration: number, unit: string }>(() => {
    if (!duration?.value) {
        return {
            duration: 0, unit: 'min.',
        };
    }

    if (duration?.value > 60) {
        return {
            duration: Math.round(duration.value / 60), unit: 'h',
        };
    } else if (duration?.value > 60 * 24) {
        return {
            duration: Math.round(duration.value / 60 / 24), unit: 'd',
        };
    } else {
        return {
            duration: duration.value, unit: 'min.',
        };
    }
});
</script>
