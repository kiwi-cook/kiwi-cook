<!--
  - Copyright (c) 2023 Josef Müller.
  -->

<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div class="content-wrapper">
                <div class="content">
                    <Header :big-text="[$t('Settings.Title')]"/>

                    <IonSelect v-model="locale" label="Set Language" label-placement="floating">
                        <IonSelectOption v-for="locale in SUPPORT_LOCALES" :key="locale" :value="locale">
                            {{ $t(`Locale.${locale}`) }}
                        </IonSelectOption>
                    </IonSelect>

                    <IonNote>
                        Made in Germany with
                        <IonIcon :icon="heart" color="danger"/>
                        by Josef and Vasilij
                    </IonNote>
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts" setup>
import { IonContent, IonIcon, IonNote, IonPage, IonSelect, IonSelectOption } from '@ionic/vue';
import { SUPPORT_LOCALES, SUPPORT_LOCALES_TYPE } from '@/shared/locales/i18n';
import { ref, watch } from 'vue';
import Header from '@/shared/components/utility/header/Header.vue';
import { heart } from 'ionicons/icons';
import { useSharedStore } from '@/shared/storage';

const sharedStore = useSharedStore();
const locale = ref<SUPPORT_LOCALES_TYPE>(sharedStore.language.lang);
watch(locale, (newLocale) => {
    sharedStore.setLanguage(newLocale);
});
</script>