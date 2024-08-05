<!--
  - Copyright (c) 2023-2024 Josef Müller.
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
                    Recipes
                </IonTabButton>

                <IonTabButton href="/ingredient/editor" tab="item-editor">
                    Ingredients
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    </IonPage>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { IonIcon, IonPage, IonProgressBar, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/vue';
import { useRecipeEditorStore } from '@/editor/storage';

const recipeStore = useRecipeEditorStore()
const loadingState = computed<boolean>(() => recipeStore.isLoading ?? false)
</script>
