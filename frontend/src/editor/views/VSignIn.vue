<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div class="page">
                <div class="content">
                    <FancyHeader :big-text="['Log into', 'Taste Buddy']"/>

                    <SignIn/>
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script setup lang="ts">
import {IonContent, IonPage} from '@ionic/vue';
import SignIn from "@/editor/components/user/SignInComponent.vue";
import FancyHeader from "@/shared/components/utility/fancy/FancyHeader.vue";
</script>