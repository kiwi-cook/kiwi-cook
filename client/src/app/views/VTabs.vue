<!--
  - Copyright (c) 2023 Josef Müller.
  -->

<template>
    <IonPage>
        <IonTabs>
            <!-- Router views -->
            <IonRouterOutlet/>

            <IonProgressBar v-show="showLoadingBar" type="indeterminate"/>
            <IonTabBar slot="bottom">
                <IonTabButton :disabled="isLoadingInitialData" href="/recipe/suggestions" tab="recipe-suggestions">
                    <IonIcon :icon="search"/>
                    {{ $t('Tabs.Explore') }}
                </IonTabButton>

                <IonTabButton :disabled="isLoadingInitialData"
                              :href="recipeOfTheDay?.getRoute() ?? '/recipe/of-the-day'" tab="recipe-of-the-day">
                    <IonIcon :icon="sparkles"/>
                    {{ $t('Tabs.RecipeOfTheDay') }}
                </IonTabButton>

                <IonTabButton :disabled="isLoadingInitialData" href="/recipe/saved" tab="saved-recipes">
                    <IonIcon :icon="heart"/>
                    {{ $t('Tabs.Favorites') }}
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    </IonPage>
</template>

<script lang="ts" setup>
import {computed} from 'vue';
import {IonIcon, IonPage, IonProgressBar, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs} from '@ionic/vue';
import {heart, search, sparkles} from 'ionicons/icons';
import {useRecipeStore} from '@/app/storage';
import {Recipe} from '@/shared';

const recipeStore = useRecipeStore()
const recipeOfTheDay = computed<Recipe>(() => recipeStore.getRecipeOfTheDay)
const isLoadingInitialData = computed(() => recipeStore.isLoadingInitial)
const showLoadingBar = computed<boolean>(() => (recipeStore.isLoading && !isLoadingInitialData.value) ?? false)
</script>