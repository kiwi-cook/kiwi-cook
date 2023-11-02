<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div class="content-wrapper">
                <div class="content">
                    <Header :big-text="['Log into', APP_NAME]"/>

                    <SignIn/>
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts" setup>
import {IonContent, IonPage} from '@ionic/vue';
import SignIn from '@/editor/components/user/SignInComponent.vue';
import Header from '@/shared/components/utility/header/Header.vue';
import {APP_NAME} from '@/shared/ts';
</script>