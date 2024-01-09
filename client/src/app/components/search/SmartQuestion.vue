<!--
  - Copyright (c) 2024 Josef Müller.
  -->

<template>
    <IonCard class="smart-question-card">
        <IonCardHeader>
            <IonCardTitle>{{ title }}</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
            {{ question }}
        </IonCardContent>
        <IonItem lines="none">
            <slot/>
        </IonItem>
    </IonCard>
</template>

<script setup>
import {IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonItem} from '@ionic/vue';

defineProps({
    title: {
        type: String, required: true
    },
    question: {
        type: String, required: true
    }
})
</script>

<style scoped>
.smart-question-card {
    max-width: 100%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border-radius: 15px;
    border: solid 1px #e0e0e0;
    background-color: #fff;
}

ion-card-header {
    background-color: #ffffff;
    border-bottom: solid 1px #e0e0e0;
}

ion-card-title {
    font-size: 1.2rem;
    color: var(--ion-color-secondary)
}

ion-card-content {
    color: #484848;
    font-size: 1rem;
    line-height: 1.4;
}

ion-item {
    --background: #ffffff;
    --padding-start: 0;
    --padding-end: 0;
    --inner-padding-end: 20px;
    --inner-padding-start: 20px;
    --border-width: 0;
}

ion-input {
    font-size: 1rem;
    --padding-start: 10px;
    --padding-end: 10px;
    --placeholder-color: #757575;
    --placeholder-font-style: italic;
    --placeholder-opacity: 0.8;
}
</style>
