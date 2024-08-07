<!--
  - Copyright (c) 2024 Josef Müller.
  -->

<template>
    <IonPage>
        <IonContent :fullscreen="true" class="ion-padding">
            <div class="settings-wrapper">
                <Header :big-text="[$t('Settings.Title')]" class="ion-margin-bottom"/>

                <IonCard>
                    <IonCardContent>
                        <IonList class="ion-no-padding" lines="full">
                            <IonItem>
                                <IonSelect
                                    v-model="locale"
                                    :label="$t('Settings.Language')"
                                    interface="popover"
                                    label-placement="stacked"
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
                                <IonLabel>{{ $t("Settings.Reset.ResetCache") }}</IonLabel>
                                <IonButton slot="end" color="danger" fill="clear" @click="resetCache">
                                    <IonIcon slot="start" :icon="trashBin"/>
                                    {{ $t("Settings.Reset.ResetCache") }}
                                </IonButton>
                            </IonItem>
                        </IonList>
                    </IonCardContent>
                </IonCard>

                <IonCard class="ion-margin-top">
                    <IonCardContent>
                        <iframe
                            frameborder="0"
                            height="1080" marginheight="0" marginwidth="0"
                            src="https://docs.google.com/forms/d/e/1FAIpQLSc2o91tqpJCxNsoVfO0MrnFewDAMlIzYnT7rwtiHR5302EvKw/viewform?embedded=true"
                            width="580">Wird geladen…
                        </iframe>

                        <div class="made-with-love">
                            <a href="https://github.com/taste-buddy/taste-buddy" rel="noopener noreferrer"
                               target="_blank">
                                Made in Germany with
                                <IonIcon :icon="heart" color="danger"/>
                                by Josef
                            </a>
                        </div>
                    </IonCardContent>
                </IonCard>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts" setup>
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonPage,
    IonSelect,
    IonSelectOption
} from '@ionic/vue';
import { SUPPORT_LOCALES, SUPPORT_LOCALES_TYPE } from '@/shared/locales/i18n';
import { ref, watch } from 'vue';
import Header from '@/shared/components/utility/header/Header.vue';
import { heart, trashBin } from 'ionicons/icons';
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

<style scoped>
.settings-wrapper {
    max-width: 600px;
    margin: 0 auto;
}

.made-with-love {
    text-align: center;
    margin-top: 20px;
    font-size: 0.9em;
    color: var(--ion-color-medium);
}

.made-with-love a {
    text-decoration: none;
    color: inherit;
}
</style>
