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
                    Home
                </IonTabButton>

                <IonTabButton href="/recipe" tab="recipe">
                    Recipe
                </IonTabButton>

                <IonTabButton href="/item/editor" tab="item-editor">
                    Item Editor
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    </IonPage>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { IonPage, IonProgressBar, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/vue';
import { useRecipeEditorStore } from '@/editor/storage';

const recipeStore = useRecipeEditorStore()
const loadingState = computed<boolean>(() => recipeStore.isLoading ?? false)
</script>