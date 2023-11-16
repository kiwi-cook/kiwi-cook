<!--
  - Copyright (c) 2023 Josef Müller.
  -->

<template>
    <IonPage>
        <IonTabs>
            <!-- Router views -->
            <IonRouterOutlet/>

            <IonProgressBar v-show="loadingState" type="indeterminate"/>
            <IonTabBar slot="bottom">
                <IonTabButton href="/home" tab="home">
                    <IonIcon :icon="homeOutline"/>
                    Home
                </IonTabButton>

                <IonTabButton href="/recipe" tab="recipe">
                    <IonIcon :icon="add"/>
                    Recipe
                </IonTabButton>

                <IonTabButton href="/item/editor" tab="item-editor">
                    <IonIcon :icon="add"/>
                    Item Editor
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    </IonPage>
</template>

<script lang="ts" setup>
import {computed} from 'vue';
import {IonIcon, IonPage, IonProgressBar, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs} from '@ionic/vue';
import {useRecipeStore} from '@/editor/storage';
import {add, homeOutline} from 'ionicons/icons';

const recipeStore = useRecipeStore()
const loadingState = computed<boolean>(() => recipeStore.isLoading ?? false)
</script>