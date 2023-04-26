<template>
    <ion-page>
        <ion-header>
            <ion-toolbar color="primary">
                <ion-title>Welcome</ion-title>
                <ion-buttons slot="primary">
                    <ion-button>
                        <ion-icon slot="icon-only" :ios="ellipsisHorizontal" :md="ellipsisVertical"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <div class="content">
                <ion-header collapse="condense">
                    <ion-toolbar>
                        <ion-title size="large">Welcome</ion-title>
                    </ion-toolbar>
                </ion-header>

                <Login />
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar} from '@ionic/vue';
import {ellipsisHorizontal, ellipsisVertical} from "ionicons/icons";
import Login from "@/components/user/LoginComponent.vue";

export default defineComponent({
    name: 'LoginPage',
    components: {
        Login,
        IonToolbar, IonIcon, IonHeader, IonContent, IonButton, IonButtons, IonTitle,
        IonPage
    },
    setup() {
        return {
            ellipsisHorizontal, ellipsisVertical
        }
    }
});
</script>