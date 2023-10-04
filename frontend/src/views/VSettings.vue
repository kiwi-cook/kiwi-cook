<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div class="page">
                <div class="content">
                    <FancyHeader :bigText="['Settings']"/>

                    <IonSelect v-model="$i18n.locale" label="Language" label-placement="floating">
                        <IonSelectOption v-for="locale in SUPPORT_LOCALES" :key="locale">
                            {{ locale }}
                        </IonSelectOption>
                    </IonSelect>

                    {{ $i18n.locale }}
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script setup lang="ts">
import {IonContent, IonPage, IonSelect, IonSelectOption} from '@ionic/vue';
import FancyHeader from "@/components/utility/fancy/FancyHeader.vue";
import {SUPPORT_LOCALES} from "@/locales/i18n.ts";
</script>