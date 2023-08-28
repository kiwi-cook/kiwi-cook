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

<script setup lang="ts">
import {IonContent, IonPage} from '@ionic/vue';
import SignIn from "@/components/user/SignInComponent.vue";
</script>