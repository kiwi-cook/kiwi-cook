<template>
    <IonPage id="login-page">
        <IonHeader>
            <IonToolbar color="primary">
                <TasteBuddyLogo slot="start" size="tiny" with-left-margin />
            </IonToolbar>
        </IonHeader>

        <IonContent :fullscreen="true">
            <div class="content">
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Sign in</IonTitle>
                    </IonToolbar>
                </IonHeader>

                <SignIn />
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/vue';
import { ellipsisHorizontal, ellipsisVertical } from "ionicons/icons";
import SignIn from "@/components/user/SignInComponent.vue";
import TasteBuddyLogo from "@/components/TasteBuddyLogo.vue";

export default defineComponent({
    name: 'LoginPage',
    components: {
        TasteBuddyLogo,
        SignIn,
        IonToolbar, IonHeader, IonContent, IonTitle,
        IonPage
    },
    setup() {
        return {
            ellipsisHorizontal, ellipsisVertical
        }
    }
});
</script>