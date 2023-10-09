<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div class="page">
                <div class="content">
                    <h1 class="header-title">
                        Hello 🍻
                    </h1>

                    <SignIn/>
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script setup lang="ts">
import {IonContent, IonPage} from '@ionic/vue';
import SignIn from "@/app/components/user/SignInComponent.vue";
</script>