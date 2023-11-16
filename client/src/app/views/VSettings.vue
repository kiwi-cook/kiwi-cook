<!--
  - Copyright (c) 2023 Josef Müller.
  -->

<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div class="content-wrapper">
                <div class="content">
                    <Header :big-text="['Settings']"/>

                    <IonSelect v-model="locale" label="Language" label-placement="floating">
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

<script lang="ts" setup>
import {IonContent, IonPage, IonSelect, IonSelectOption} from '@ionic/vue';
import {SUPPORT_LOCALES, SUPPORT_LOCALES_TYPE} from '@/shared/locales/i18n';
import {ref, watch} from 'vue';
import {useTasteBuddyStore} from '@/app/storage';
import Header from '@/shared/components/utility/header/Header.vue';

const tasteBuddyStore = useTasteBuddyStore();
const locale = ref<SUPPORT_LOCALES_TYPE>(SUPPORT_LOCALES[0]);
watch(locale, (newLocale) => {
    tasteBuddyStore.setLanguage(newLocale);
});
</script>