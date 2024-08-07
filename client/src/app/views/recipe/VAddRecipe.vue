<!--
  - Copyright (c) 2024 Josef Müller.
  -->

<template>
    <IonPage>
        <IonHeader :translucent="true">
            <IonToolbar>
                <IonTitle class="content-margin ion-no-padding">
                    <!-- Title -->
                    Add a Recipe
                </IonTitle>
            </IonToolbar>
        </IonHeader>
        <IonContent :fullscreen="true">
            <IonHeader collapse="condense">
                <IonToolbar>
                    <Header
                        :big-text="['Add a', 'Recipe']"
                    />
                </IonToolbar>
            </IonHeader>
            <div class="content-wrapper">
                <div class="content">
                    <div class="content-margin">
                        <IonItem class="ion-margin-top">
                            <IonInput v-model="url" label="URL of the recipe" label-placement="floating"
                                      placeholder="URL of the recipe"
                                      type="url"/>
                        </IonItem>
                        <IonText>
                            <h2>{{ message }}</h2>
                        </IonText>
                        <IonButton :disabled="sentRequest || !url" @click="addRecipe">
                            Add recipe
                        </IonButton>
                    </div>
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts" setup>
import {
    IonButton,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonPage,
    IonText,
    IonTitle,
    IonToolbar
} from '@ionic/vue';
import { API_ROUTE, sendToAPI } from '@/shared';
import Header from '@/shared/components/utility/header/Header.vue';
import { ref } from 'vue';
import { logDebug } from '@/shared/utils/logging.ts';

const url = ref('');

const sentRequest = ref(false);
const message = ref('');

const addRecipe = async () => {
    if (!url.value) {
        message.value = 'Please enter a URL.';
        return;
    }

    sentRequest.value = true;
    try {
        logDebug('Adding recipe via URL', url.value)
        const response = await sendToAPI<string>(API_ROUTE.ADD_RECIPE_VIA_URL, { formatObject: { url: url.value } });
        message.value = response.response;
    } catch (error) {
        message.value = 'Failed to add recipe. Please try again.';
    } finally {
        sentRequest.value = false;
    }
}
</script>
