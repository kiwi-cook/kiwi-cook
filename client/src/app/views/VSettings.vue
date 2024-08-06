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
                                <IonSelect
                                    v-model="locale"
                                    label="Set Language"
                                    label-placement="floating"
                                >
                                    <IonSelectOption
                                        v-for="locale in SUPPORT_LOCALES"
                                        :key="locale"
                                        :value="locale"
                                    >
                                        {{ $t(`Locale.${locale}`) }}
                                    </IonSelectOption>
                                </IonSelect>
                            </IonItem>

                            <IonItem>
                                <IonButton color="danger" @click="resetCache">
                                    {{ $t("Settings.Reset.ResetCache") }}
                                </IonButton>
                            </IonItem>
                        </IonList>

                        <IonItem lines="none">
                            <a href="https://github.com/taste-buddy/taste-buddy" rel="noopener noreferrer"
                               target="_blank">
                                Made in Germany with
                                <IonIcon :icon="heart" color="favorite"/>
                                by Josef</a>
                        </IonItem>
                    </div>
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts" setup>
import { IonButton, IonContent, IonIcon, IonItem, IonList, IonPage, IonSelect, IonSelectOption, } from '@ionic/vue';
import { SUPPORT_LOCALES, SUPPORT_LOCALES_TYPE } from '@/shared/locales/i18n';
import { ref, watch } from 'vue';
import Header from '@/shared/components/utility/header/Header.vue';
import { heart } from 'ionicons/icons';
import { useSharedRecipeStore } from '@/shared/storage';
import { useLanguage } from '@/composables/useLanguage.ts';

const sharedRecipeStore = useSharedRecipeStore();

const resetCache = () => {
    sharedRecipeStore.resetStore();
};

const language = useLanguage();
const locale = ref<SUPPORT_LOCALES_TYPE>(language.lang.value);
watch(locale, (newLocale) => {
    language.setLanguage(newLocale);
});
</script>
