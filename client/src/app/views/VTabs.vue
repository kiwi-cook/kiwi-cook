<!--
  - Copyright (c) 2023-2024 Josef Müller.
  -->

<template>
    <IonPage>
        <IonTabs>
            <!-- Router views -->
            <IonRouterOutlet/>

            <IonProgressBar v-show="showLoadingBar" type="indeterminate"/>
            <IonTabBar slot="bottom" :translucent="true" selected-tab="recipe-suggestions">
                <IonTabButton :disabled="isLoadingInitial" href="/recipe/saved" tab="saved-recipes">
                    <IonIcon :icon="heart"/>
                    {{ $t('Tabs.Favorites') }}
                </IonTabButton>

                <IonTabButton :disabled="isLoadingInitial"
                              href="/recipe/suggestions"
                              tab="recipe-suggestions">
                    <IonIcon :icon="sparkles"/>
                    {{ $t('Tabs.Explore') }}
                </IonTabButton>

                <IonTabButton href="/settings" tab="settings">
                    <IonIcon :icon="settings"/>
                    {{ $t('Tabs.Settings') }}
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    </IonPage>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { IonIcon, IonPage, IonProgressBar, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/vue';
import { heart, settings, sparkles } from 'ionicons/icons';
import { useSharedStore } from '@/shared/storage';
import { storeToRefs } from 'pinia';

const shared = useSharedStore()
const { isLoadingInitial } = storeToRefs(shared)

const showLoadingBar = computed<boolean>(() => !isLoadingInitial ?? false)
</script>

<style scoped>
ion-tab-bar {
    contain: none;
}
</style>
