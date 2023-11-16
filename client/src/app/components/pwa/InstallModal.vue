<!--
  - Copyright (c) 2023 Josef Müller.
  -->

<template>
    <IonModal v-if="canBeInstalled" @on-did-dismiss="setShowModal(false)">
        <IonHeader>
            <IonToolbar>
                <IonButtons slot="start">
                    <IonButton color="medium" @click="cancel">Cancel</IonButton>
                </IonButtons>
                <IonTitle>Modal</IonTitle>
                <IonButtons slot="end">
                    <IonButton :strong="true" @click="confirm">Confirm</IonButton>
                </IonButtons>
            </IonToolbar>
        </IonHeader>
        <IonContent>
            <IonList>
                <IonItem>
                    <IonLabel>Install {{ APP_NAME }}</IonLabel>
                    <IonButton @click="install()">Install</IonButton>
                </IonItem>
            </IonList>
        </IonContent>
    </IonModal>
</template>

<script lang="ts" setup>
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonModal,
    IonTitle,
    IonToolbar
} from '@ionic/vue';

import {canBeInstalled, showInstallationPrompt} from '@/app/ts';
import {APP_NAME} from '@/shared';

const install = () => {
    showInstallationPrompt()
}
</script>