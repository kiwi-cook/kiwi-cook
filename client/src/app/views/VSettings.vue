<!--
  - Copyright (c) 2023-2024 Josef Müller.
  -->

<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div class="content-wrapper">
                <div class="content">
                    <div class="content-margin">
                        <Header :big-text="[$t('Settings.Title')]"/>

                        <IonList class="ion-no-padding" lines="none">
                            <IonItem>
                                <IonSelect v-model="locale" label="Set Language" label-placement="floating">
                                    <IonSelectOption v-for="locale in SUPPORT_LOCALES" :key="locale" :value="locale">
                                        {{ $t(`Locale.${locale}`) }}
                                    </IonSelectOption>
                                </IonSelect>
                            </IonItem>

                            <IonItem>
                                <IonButton color="danger" @click="resetCache">
                                    {{ $t('Settings.Reset.ResetCache') }}
                                </IonButton>
                            </IonItem>
                        </IonList>

                        <IonNote>
                            Made in Germany with
                            <IonIcon :icon="heart" color="favorite"/>
                            by Josef
                        </IonNote>
                    </div>
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts" setup>
import {
    IonButton,
    IonContent,
    IonIcon,
    IonItem,
    IonList,
    IonNote,
    IonPage,
    IonSelect,
    IonSelectOption
} from '@ionic/vue';
import { SUPPORT_LOCALES, SUPPORT_LOCALES_TYPE } from '@/shared/locales/i18n';
import { ref, watch } from 'vue';
import Header from '@/shared/components/utility/header/Header.vue';
import { heart } from 'ionicons/icons';
import { useSharedRecipeStore, useSharedStore } from '@/shared/storage';

const sharedStore = useSharedStore();
const sharedRecipeStore = useSharedRecipeStore();

const resetCache = () => {
    sharedRecipeStore.resetStore();
};

const locale = ref<SUPPORT_LOCALES_TYPE>(sharedStore.language.lang);
watch(locale, (newLocale) => {
    sharedStore.setLanguage(newLocale);
});
</script>
