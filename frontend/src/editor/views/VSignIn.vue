<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div class="content-wrapper">
                <div class="content">
                    <TypedHeader :big-text="['Log into', 'Taste Buddy']"/>

                    <SignIn/>
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts" setup>
import {IonContent, IonPage} from '@ionic/vue';
import SignIn from "@/editor/components/user/SignInComponent.vue";
import TypedHeader from "@/shared/components/utility/header/TypedHeader.vue";
</script>