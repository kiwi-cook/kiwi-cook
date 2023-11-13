<template>
    <IonApp>
        <IonRouterOutlet/>
    </IonApp>
</template>

<script lang="ts" setup>
import {IonApp, IonRouterOutlet} from '@ionic/vue';
import {prepareThemeColor} from '@/shared/ts/theme.ts';

// Initialize the dark theme
prepareThemeColor()
</script>