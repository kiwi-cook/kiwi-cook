<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <div class="page">
                <div class="content">
                    <FancyHeader :bigText="['Settings']"/>

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

<script setup lang="ts">
import {IonContent, IonPage, IonSelect, IonSelectOption} from '@ionic/vue';
import FancyHeader from "@/components/utility/fancy/FancyHeader.vue";
import {SUPPORT_LOCALES, SUPPORT_LOCALES_TYPE} from "@/locales/i18n.ts";
import {ref, watch} from "vue";
import {useTasteBuddyStore} from "@/storage";

const tasteBuddyStore = useTasteBuddyStore();
const locale = ref<SUPPORT_LOCALES_TYPE>(SUPPORT_LOCALES[0]);
watch(locale, (newLocale) => {
    tasteBuddyStore.setLanguage(newLocale);
});
</script>