<template>
    <ion-page>
        <ion-header>
            <ion-toolbar color="primary">
                <ion-title color="light">Profil</ion-title>
                <ion-buttons slot="primary">
                    <ion-button>
                        <ion-icon color="light" slot="icon-only" :ios="ellipsisHorizontal"
                            :md="ellipsisVertical"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <div class="content">
                <LoginComponent></LoginComponent>
            </div>
        </ion-content>
    </ion-page>
</template>
  
<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonButtons, IonButton } from '@ionic/vue';

import LoginComponent from '@/components/LoginComponent.vue';
import { ellipsisHorizontal, ellipsisVertical } from 'ionicons/icons';

export default defineComponent({
    name: 'LoginPage',
    components: {
        LoginComponent,
        IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonButtons, IonButton
    },
    setup () {
        return {
            ellipsisHorizontal, ellipsisVertical
        }
    }
});
</script>
