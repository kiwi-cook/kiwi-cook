<!--
  - Copyright (c) 2023-2024 Josef Müller.
  -->

<template>
    <IonPage id="items-editor-page">
        <IonContent :fullscreen="true">
            <div class="content-wrapper">
                <div class="content">
                    <Header :big-text="['Recipe', 'URL Parser']"/>

                    <!-- Enter the URL -->
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>
                                Parse recipes from URL
                            </IonCardTitle>
                            <IonCardSubtitle>
                                Enter the URL of the recipe
                            </IonCardSubtitle>
                        </IonCardHeader>

                        <IonCardContent>
                            <IonInput v-model="url" autofocus clear-input
                                      label="URL"
                                      label-placement="floating" pattern="https?://.+"
                                      placeholder="e.g. https://cooking.nytimes.com/recipes/9530-lasagna" required
                                      spellcheck
                                      title="Add a recipe URL" type="url" @keydown.enter="addUrl"/>
                            <IonButton @click="addUrl">Add URL</IonButton>

                            <IonList>
                                <IonItem v-for="url in urls" :key="url">
                                    {{ url }}
                                    <IonButton color="danger" fill="outline" @click="urls.splice(urls.indexOf(url), 1)">
                                        <IonIcon :icon="closeOutline"/>
                                    </IonButton>
                                </IonItem>
                            </IonList>
                        </IonCardContent>

                        <IonCardContent v-if="urls.length > 0">
                            <IonButton @click="parse()">Parse</IonButton>
                            <p>{{ message }}</p>
                        </IonCardContent>
                    </IonCard>
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts" setup>
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonContent,
    IonIcon,
    IonInput,
    IonItem,
    IonList,
    IonPage
} from '@ionic/vue';
import Header from '@/shared/components/utility/header/Header.vue';
import { ref } from 'vue';
import { API_ROUTE, sendToAPI } from '@/shared';
import { closeOutline } from 'ionicons/icons';

const url = ref<string>('')
const addUrl = () => {
    if (url.value === '') {
        return
    }
    urls.value.push(url.value)
    url.value = ''
}
const urls = ref<string[]>([])
const message = ref('')
const parse = () => sendToAPI<string>(API_ROUTE.PARSE_RECIPES, {
    body: urls
}).then((response) => {
    message.value = response.response
    urls.value = []
})
</script>
