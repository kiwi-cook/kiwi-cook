<!--
  - Copyright (c) 2024 Josef Müller.
  -->

<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div class="content-wrapper">
                <div class="content">
                    <div class="content-margin">
                        <Header
                            :big-text="['Add a', 'Recipe']"
                            :small-text="subtitle"
                        />
                    </div>

                    <div class="content-margin">
                        <IonItem lines="none">
                            <IonInput v-model="url" placeholder="URL of the recipe"/>
                        </IonItem>
                        <IonText>
                            <h2>{{ message }}</h2>
                        </IonText>
                        <IonButton :disabled="sentRequest" @click="addRecipe">
                            Add recipe
                        </IonButton>
                    </div>
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts" setup>
import { IonButton, IonContent, IonInput, IonItem, IonPage, IonText } from '@ionic/vue';
import { API_ROUTE, sendToAPI } from '@/shared';
import Header from '@/shared/components/utility/header/Header.vue';
import { useRoute } from 'vue-router';
import { computed, ref } from 'vue';
import { logDebug } from '@/shared/utils/logging.ts';

const route = useRoute();
const url = ref(route.query.url as string || '');

const sentRequest = ref(false);
const subtitle = computed(() => `Add a recipe from ${url.value}`);
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
