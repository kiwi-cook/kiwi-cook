<template>
    <IonPage id="login-page">
        <IonContent :fullscreen="true">
            <div class="content">
                <h1 class="header-title">
                    Hello 🍻
                </h1>

                <SignIn/>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {IonContent, IonPage,} from '@ionic/vue';
import {ellipsisHorizontal, ellipsisVertical} from "ionicons/icons";
import SignIn from "@/components/user/SignInComponent.vue";

export default defineComponent({
    name: 'LoginPage',
    components: {
        SignIn, IonContent, IonPage
    },
    setup() {
        return {
            ellipsisHorizontal, ellipsisVertical
        }
    }
});
</script>