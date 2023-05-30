<template>
    <ion-menu content-id="login-page">
        <ion-content class="ion-padding">
        </ion-content>
    </ion-menu>
    <ion-page id="login-page">
        <ion-header>
            <ion-toolbar color="primary">
                <TasteBuddyLogo size="tiny" with-left-margin slot="start"/>
                <ion-buttons slot="primary">
                    <ion-button>
                        <ion-menu-button></ion-menu-button>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <div class="content">
                <ion-header collapse="condense">
                    <ion-toolbar>
                        <ion-title size="large">Sign in</ion-title>
                    </ion-toolbar>
                </ion-header>

                <SignIn/>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonMenu,
    IonMenuButton,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/vue';
import {ellipsisHorizontal, ellipsisVertical} from "ionicons/icons";
import SignIn from "@/components/user/SignInComponent.vue";
import TasteBuddyLogo from "@/components/general/TasteBuddyLogo.vue";

export default defineComponent({
    name: 'LoginPage',
    components: {
        TasteBuddyLogo,
        SignIn,
        IonToolbar, IonHeader, IonContent, IonButton, IonButtons, IonTitle, IonMenuButton, IonMenu,
        IonPage
    },
    setup() {
        return {
            ellipsisHorizontal, ellipsisVertical
        }
    }
});
</script>