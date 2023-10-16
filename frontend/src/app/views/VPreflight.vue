<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div class="content-wrapper">
                <div class="content">
                    <HeaderTyped :big-text="['Welcome', `to ${APP_NAME}`]"/>
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts" setup>
import {IonContent, IonPage, isPlatform} from "@ionic/vue";
import HeaderTyped from "@/shared/components/utility/header/HeaderTyped.vue";
import {APP_NAME} from "@/shared/ts";

if (!isPlatform('mobile') || isPlatform('tablet') || isPlatform('pwa')) {
    // Encourage users to install the app
    // (Only show on mobile devices)
    const installPromptEvent = new Event('beforeinstallprompt');
    window.dispatchEvent(installPromptEvent);

    window.addEventListener('beforeinstallprompt', (event) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        event.preventDefault();
        // Stash the event so it can be triggered later.
        window.deferredPrompt = event;
    });

    const installButton = document.getElementById('install-button');

}
</script>